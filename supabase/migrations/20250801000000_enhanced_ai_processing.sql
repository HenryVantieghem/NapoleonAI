-- Enhanced AI Processing Logs Table
-- Supports comprehensive metrics tracking for Napoleon AI executive intelligence

CREATE TABLE IF NOT EXISTS ai_processing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  message_id TEXT,
  batch_id TEXT,
  operation_type TEXT NOT NULL DEFAULT 'single_process',
  
  -- Processing metrics
  processing_time_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  
  -- Success tracking
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- Enhanced AI features
  vip_boost_applied INTEGER DEFAULT 0,
  priority_score INTEGER,
  confidence_score DECIMAL(3,2),
  model_version TEXT DEFAULT 'gpt-4',
  prompt_version TEXT DEFAULT '1.0',
  
  -- Batch processing
  messages_processed INTEGER DEFAULT 1,
  messages_failed INTEGER DEFAULT 0,
  
  -- Executive intelligence features
  board_member_detected BOOLEAN DEFAULT false,
  investor_communication BOOLEAN DEFAULT false,
  crisis_keywords_detected BOOLEAN DEFAULT false,
  regulatory_content_detected BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance indexes
  CONSTRAINT fk_ai_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_processing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_processing_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_batch_id ON ai_processing_logs(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_logs_operation_type ON ai_processing_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON ai_processing_logs(success);

-- RLS Policies
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own AI processing logs
CREATE POLICY ai_logs_user_access ON ai_processing_logs
  FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Enhanced VIP Contacts Table Updates
ALTER TABLE vip_contacts ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'vip';
ALTER TABLE vip_contacts ADD COLUMN IF NOT EXISTS board_member BOOLEAN DEFAULT false;
ALTER TABLE vip_contacts ADD COLUMN IF NOT EXISTS investor BOOLEAN DEFAULT false;
ALTER TABLE vip_contacts ADD COLUMN IF NOT EXISTS last_interaction TIMESTAMPTZ;
ALTER TABLE vip_contacts ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0;

-- Messages Table Enhancements for AI Analysis
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ai_analysis_complete BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS decision_required BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS stakeholder_level TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS strategic_category TEXT;

-- Action Items Table Enhancements
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('strategic', 'relationship', 'operational', 'market', 'administrative'));
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS estimated_duration TEXT;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS delegation_possible BOOLEAN DEFAULT false;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS suggested_delegate TEXT;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS stakeholders JSONB;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS confidentiality_level TEXT CHECK (confidentiality_level IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'internal';
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS prep_materials_needed JSONB;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS calendar_blocking_needed BOOLEAN DEFAULT false;

-- Executive Metrics View for Dashboard
CREATE OR REPLACE VIEW executive_ai_metrics AS
SELECT 
  user_id,
  DATE_TRUNC('day', created_at) as processing_date,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE success = true) as successful_operations,
  COUNT(*) FILTER (WHERE success = false) as failed_operations,
  ROUND(AVG(processing_time_ms), 0) as avg_processing_time,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  COUNT(*) FILTER (WHERE vip_boost_applied > 0) as vip_boosts,
  COUNT(*) FILTER (WHERE board_member_detected = true) as board_communications,
  COUNT(*) FILTER (WHERE investor_communication = true) as investor_communications,
  COUNT(*) FILTER (WHERE crisis_keywords_detected = true) as crisis_alerts,
  MAX(created_at) as last_processing
FROM ai_processing_logs
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- Grant access to the view
GRANT SELECT ON executive_ai_metrics TO authenticated;

-- RLS for the view
ALTER VIEW executive_ai_metrics OWNER TO postgres;

-- Performance monitoring function
CREATE OR REPLACE FUNCTION get_user_ai_performance(target_user_id TEXT, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  avg_processing_time_ms FLOAT,
  success_rate FLOAT,
  total_cost_usd FLOAT,
  vip_processing_ratio FLOAT,
  daily_message_count FLOAT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(processing_time_ms)::FLOAT,
    (COUNT(*) FILTER (WHERE success = true)::FLOAT / COUNT(*)::FLOAT * 100)::FLOAT,
    SUM(cost_usd)::FLOAT,
    (COUNT(*) FILTER (WHERE vip_boost_applied > 0)::FLOAT / COUNT(*)::FLOAT * 100)::FLOAT,
    (COUNT(*)::FLOAT / days_back::FLOAT)::FLOAT
  FROM ai_processing_logs
  WHERE user_id = target_user_id
    AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;

-- Executive dashboard summary function
CREATE OR REPLACE FUNCTION get_executive_dashboard_summary(target_user_id TEXT)
RETURNS TABLE (
  high_priority_messages INTEGER,
  vip_messages INTEGER,
  pending_actions INTEGER,
  board_communications INTEGER,
  processing_health_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_messages INTEGER;
  successful_processing INTEGER;
  health_score INTEGER;
BEGIN
  -- Get message counts
  SELECT COUNT(*) INTO high_priority_messages
  FROM messages 
  WHERE user_id = target_user_id 
    AND priority_score >= 80
    AND created_at >= NOW() - INTERVAL '24 hours';
    
  SELECT COUNT(*) INTO vip_messages
  FROM messages 
  WHERE user_id = target_user_id 
    AND is_vip = true
    AND created_at >= NOW() - INTERVAL '24 hours';
    
  SELECT COUNT(*) INTO pending_actions
  FROM action_items 
  WHERE user_id = target_user_id 
    AND status = 'pending';
    
  SELECT COUNT(*) INTO board_communications
  FROM ai_processing_logs 
  WHERE user_id = target_user_id 
    AND board_member_detected = true
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Calculate processing health score (0-100)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE success = true)
  INTO total_messages, successful_processing
  FROM ai_processing_logs 
  WHERE user_id = target_user_id 
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  processing_health_score := CASE 
    WHEN total_messages = 0 THEN 100
    ELSE (successful_processing * 100 / total_messages)
  END;
  
  RETURN QUERY SELECT 
    high_priority_messages,
    vip_messages,
    pending_actions,
    board_communications,
    processing_health_score;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE ai_processing_logs IS 'Comprehensive AI processing metrics for Napoleon AI executive intelligence';
COMMENT ON COLUMN ai_processing_logs.vip_boost_applied IS 'Points added to priority score for VIP contacts';
COMMENT ON COLUMN ai_processing_logs.board_member_detected IS 'True if sender detected as board member';
COMMENT ON COLUMN ai_processing_logs.investor_communication IS 'True if communication is investor-related';
COMMENT ON COLUMN ai_processing_logs.crisis_keywords_detected IS 'True if crisis management keywords detected';
COMMENT ON VIEW executive_ai_metrics IS 'Daily aggregated AI processing metrics for executive dashboard';
COMMENT ON FUNCTION get_user_ai_performance IS 'Returns AI processing performance metrics for a user';
COMMENT ON FUNCTION get_executive_dashboard_summary IS 'Returns executive dashboard summary data';