-- AI Processing and Analysis Tables for Napoleon AI

-- Message Analysis Results
CREATE TABLE public.message_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    urgency TEXT NOT NULL CHECK (urgency IN ('immediate', 'today', 'thisWeek', 'normal')),
    business_impact TEXT NOT NULL CHECK (business_impact IN ('very-high', 'high', 'medium', 'low')),
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
    topics TEXT[] DEFAULT '{}',
    action_required BOOLEAN DEFAULT false,
    decision_required BOOLEAN DEFAULT false,
    financial_impact BIGINT DEFAULT 0,
    stakeholder_level TEXT CHECK (stakeholder_level IN ('board', 'executive', 'management', 'staff', 'external')),
    time_to_decision INTEGER, -- hours
    risk_level TEXT CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    confidence DECIMAL(3,2) DEFAULT 0.80,
    reasoning TEXT,
    suggested_actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Executive Summaries
CREATE TABLE public.executive_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}',
    decision_required TEXT,
    business_impact TEXT,
    recommended_action TEXT,
    timeframe TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Action Items
CREATE TABLE public.action_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue', 'cancelled', 'delegated')),
    due_date TIMESTAMPTZ,
    estimated_duration INTEGER, -- minutes
    assigned_to TEXT,
    business_impact TEXT CHECK (business_impact IN ('very-high', 'high', 'medium', 'low')),
    dependencies TEXT[] DEFAULT '{}',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Communication Insights
CREATE TABLE public.communication_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patterns JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    trends JSONB DEFAULT '[]',
    delegation_opportunities JSONB DEFAULT '[]',
    efficiency_metrics JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Decision Contexts
CREATE TABLE public.decision_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL,
    stakeholders JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '{}',
    risk_assessment JSONB DEFAULT '{}',
    options JSONB DEFAULT '[]',
    recommendations TEXT[] DEFAULT '{}',
    precedents TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'decided', 'cancelled')),
    decision_made_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- AI Processing Jobs
CREATE TABLE public.ai_processing_jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('analysis', 'summarization', 'action-extraction', 'insight-generation', 'decision-context')),
    message_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    result JSONB,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages table (main message storage)
CREATE TABLE public.messages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_role TEXT,
    sender_email TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('gmail', 'slack', 'teams')),
    thread_id TEXT,
    is_read BOOLEAN DEFAULT false,
    has_attachments BOOLEAN DEFAULT false,
    attachment_count INTEGER DEFAULT 0,
    external_id TEXT, -- Original message ID from source platform
    external_thread_id TEXT,
    metadata JSONB DEFAULT '{}',
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Communication Metrics (daily aggregates)
CREATE TABLE public.communication_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    messages_by_channel JSONB DEFAULT '{}',
    messages_by_priority JSONB DEFAULT '{}',
    avg_response_time INTEGER DEFAULT 0, -- minutes
    action_items_created INTEGER DEFAULT 0,
    action_items_completed INTEGER DEFAULT 0,
    decisions_made INTEGER DEFAULT 0,
    delegation_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, date)
);

-- Business Impact Assessments
CREATE TABLE public.business_impact_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    impact_level TEXT NOT NULL CHECK (impact_level IN ('very-high', 'high', 'medium', 'low')),
    financial_min BIGINT DEFAULT 0,
    financial_max BIGINT DEFAULT 0,
    timeframe TEXT,
    stakeholder_impact TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',
    confidence DECIMAL(3,2) DEFAULT 0.80,
    competitive_implications JSONB DEFAULT '{}',
    regulatory_implications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_message_analysis_user_id ON public.message_analysis(user_id);
CREATE INDEX idx_message_analysis_priority ON public.message_analysis(priority);
CREATE INDEX idx_message_analysis_created_at ON public.message_analysis(created_at);
CREATE INDEX idx_message_analysis_message_id ON public.message_analysis(message_id);

CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_channel ON public.messages(channel);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

CREATE INDEX idx_action_items_user_id ON public.action_items(user_id);
CREATE INDEX idx_action_items_status ON public.action_items(status);
CREATE INDEX idx_action_items_priority ON public.action_items(priority);
CREATE INDEX idx_action_items_due_date ON public.action_items(due_date);

CREATE INDEX idx_ai_processing_jobs_status ON public.ai_processing_jobs(status);
CREATE INDEX idx_ai_processing_jobs_priority ON public.ai_processing_jobs(priority);
CREATE INDEX idx_ai_processing_jobs_created_at ON public.ai_processing_jobs(created_at);

CREATE INDEX idx_communication_metrics_user_date ON public.communication_metrics(user_id, date);
CREATE INDEX idx_decision_contexts_user_id ON public.decision_contexts(user_id);
CREATE INDEX idx_decision_contexts_status ON public.decision_contexts(status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_impact_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view their own message analysis" ON public.message_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own executive summaries" ON public.executive_summaries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own action items" ON public.action_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own communication insights" ON public.communication_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own decision contexts" ON public.decision_contexts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own processing jobs" ON public.ai_processing_jobs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages" ON public.messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own communication metrics" ON public.communication_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own business impact assessments" ON public.business_impact_assessments
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_message_analysis_updated_at BEFORE UPDATE ON public.message_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON public.action_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_contexts_updated_at BEFORE UPDATE ON public.decision_contexts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update action item status based on due date
CREATE OR REPLACE FUNCTION update_overdue_action_items()
RETURNS void AS $$
BEGIN
    UPDATE public.action_items 
    SET status = 'overdue', updated_at = now()
    WHERE status = 'pending' 
    AND due_date < now() 
    AND due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily communication metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        INSERT INTO public.communication_metrics (
            user_id,
            date,
            total_messages,
            messages_by_channel,
            messages_by_priority,
            action_items_created,
            action_items_completed
        )
        SELECT 
            user_record.id,
            target_date,
            COUNT(*) as total_messages,
            COALESCE(
                jsonb_object_agg(channel, channel_count) FILTER (WHERE channel IS NOT NULL),
                '{}'::jsonb
            ) as messages_by_channel,
            COALESCE(
                jsonb_object_agg(priority, priority_count) FILTER (WHERE priority IS NOT NULL),
                '{}'::jsonb
            ) as messages_by_priority,
            COALESCE(ai_created.count, 0) as action_items_created,
            COALESCE(ai_completed.count, 0) as action_items_completed
        FROM (
            SELECT 
                m.channel,
                ma.priority,
                COUNT(*) OVER (PARTITION BY m.channel) as channel_count,
                COUNT(*) OVER (PARTITION BY ma.priority) as priority_count
            FROM public.messages m
            LEFT JOIN public.message_analysis ma ON m.id = ma.message_id
            WHERE m.user_id = user_record.id
            AND DATE(m.created_at) = target_date
        ) AS msg_data
        LEFT JOIN (
            SELECT COUNT(*) as count
            FROM public.action_items
            WHERE user_id = user_record.id
            AND DATE(created_at) = target_date
        ) AS ai_created ON true
        LEFT JOIN (
            SELECT COUNT(*) as count
            FROM public.action_items
            WHERE user_id = user_record.id
            AND DATE(completed_at) = target_date
            AND status = 'completed'
        ) AS ai_completed ON true
        GROUP BY user_record.id, ai_created.count, ai_completed.count
        ON CONFLICT (user_id, date) 
        DO UPDATE SET
            total_messages = EXCLUDED.total_messages,
            messages_by_channel = EXCLUDED.messages_by_channel,
            messages_by_priority = EXCLUDED.messages_by_priority,
            action_items_created = EXCLUDED.action_items_created,
            action_items_completed = EXCLUDED.action_items_completed,
            created_at = now();
    END LOOP;
END;
$$ LANGUAGE plpgsql;