-- Advanced Features Tables for Napoleon AI

-- VIP Contacts Management
CREATE TABLE public.vip_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    importance TEXT NOT NULL CHECK (importance IN ('board', 'investor', 'customer', 'partner', 'executive', 'team', 'media')),
    relationship TEXT NOT NULL CHECK (relationship IN ('superior', 'peer', 'direct-report', 'external', 'stakeholder')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    last_contact TIMESTAMPTZ DEFAULT now(),
    interaction_count INTEGER DEFAULT 0,
    response_time_expected INTEGER DEFAULT 1440, -- minutes
    preferred_channel TEXT DEFAULT 'any' CHECK (preferred_channel IN ('gmail', 'slack', 'teams', 'any')),
    timezone TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, email)
);

-- VIP Classification Rules
CREATE TABLE public.vip_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Search Queries and Analytics
CREATE TABLE public.search_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    filters_used JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Team Members for Delegation
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    skills TEXT[] DEFAULT '{}',
    availability JSONB NOT NULL DEFAULT '{}',
    workload JSONB NOT NULL DEFAULT '{"current": 0, "capacity": 100}',
    delegation_history JSONB NOT NULL DEFAULT '{"totalTasks": 0, "completionRate": 0, "avgResponseTime": 0, "avgQualityScore": 0}',
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, email)
);

-- Delegation Rules
CREATE TABLE public.delegation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    delegated_to TEXT NOT NULL,
    approval_required BOOLEAN DEFAULT false,
    escalation_rules JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Delegation Tasks
CREATE TABLE public.delegation_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id TEXT REFERENCES public.messages(id) ON DELETE CASCADE,
    delegated_to TEXT NOT NULL,
    delegated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'escalated', 'rejected')),
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    due_date TIMESTAMPTZ,
    instructions TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    response TEXT,
    feedback TEXT,
    completed_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Smart Notifications
CREATE TABLE public.smart_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id TEXT REFERENCES public.messages(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('message_received', 'priority_alert', 'vip_communication', 'deadline_reminder', 'delegation_update', 'meeting_reminder', 'system_alert', 'digest_summary')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    channels TEXT[] NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'delivered', 'read', 'dismissed', 'failed')),
    intelligence_data JSONB DEFAULT '{}',
    scheduled_for TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notification Rules
CREATE TABLE public.notification_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    triggers JSONB NOT NULL DEFAULT '[]',
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    schedule JSONB DEFAULT '{}',
    quiet_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notification Preferences
CREATE TABLE public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channels JSONB NOT NULL DEFAULT '{}',
    batch_delivery JSONB DEFAULT '{}',
    intelligent_summary JSONB DEFAULT '{}',
    do_not_disturb JSONB DEFAULT '{}',
    priorities JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id)
);

-- Email Templates and Quick Responses
CREATE TABLE public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quick Response Suggestions
CREATE TABLE public.quick_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_keywords TEXT[] DEFAULT '{}',
    response_text TEXT NOT NULL,
    tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'formal', 'brief')),
    category TEXT DEFAULT 'general',
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Meeting Integration and Calendar Sync
CREATE TABLE public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    attendees JSONB DEFAULT '[]',
    meeting_url TEXT,
    platform TEXT CHECK (platform IN ('outlook', 'google', 'teams')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    related_messages TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Executive Analytics and Insights
CREATE TABLE public.executive_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('communication_pattern', 'productivity_trend', 'delegation_opportunity', 'time_optimization', 'stakeholder_analysis')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    business_impact TEXT CHECK (business_impact IN ('high', 'medium', 'low')),
    actionable_recommendations TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'acted_upon', 'dismissed')),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Message Embeddings for Semantic Search
CREATE TABLE public.message_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 embedding size
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(message_id)
);

-- Indexes for performance
CREATE INDEX idx_vip_contacts_user_id ON public.vip_contacts(user_id);
CREATE INDEX idx_vip_contacts_importance ON public.vip_contacts(importance);
CREATE INDEX idx_vip_contacts_email ON public.vip_contacts(email);
CREATE INDEX idx_vip_contacts_last_contact ON public.vip_contacts(last_contact);

CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX idx_search_queries_created_at ON public.search_queries(created_at);

CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_active ON public.team_members(is_active);

CREATE INDEX idx_delegation_tasks_user_id ON public.delegation_tasks(user_id);
CREATE INDEX idx_delegation_tasks_delegated_to ON public.delegation_tasks(delegated_to);
CREATE INDEX idx_delegation_tasks_status ON public.delegation_tasks(status);
CREATE INDEX idx_delegation_tasks_due_date ON public.delegation_tasks(due_date);

CREATE INDEX idx_smart_notifications_user_id ON public.smart_notifications(user_id);
CREATE INDEX idx_smart_notifications_status ON public.smart_notifications(status);
CREATE INDEX idx_smart_notifications_priority ON public.smart_notifications(priority);
CREATE INDEX idx_smart_notifications_scheduled_for ON public.smart_notifications(scheduled_for);

CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);

CREATE INDEX idx_quick_responses_user_id ON public.quick_responses(user_id);
CREATE INDEX idx_quick_responses_category ON public.quick_responses(category);
CREATE INDEX idx_quick_responses_active ON public.quick_responses(is_active);

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_platform ON public.calendar_events(platform);

CREATE INDEX idx_executive_insights_user_id ON public.executive_insights(user_id);
CREATE INDEX idx_executive_insights_type ON public.executive_insights(insight_type);
CREATE INDEX idx_executive_insights_status ON public.executive_insights(status);

-- Vector similarity search index for embeddings
CREATE INDEX ON public.message_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) Policies
ALTER TABLE public.vip_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage their own VIP contacts" ON public.vip_contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own VIP rules" ON public.vip_rules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own search queries" ON public.search_queries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own team members" ON public.team_members
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own delegation rules" ON public.delegation_rules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view delegation tasks assigned to/by them" ON public.delegation_tasks
    FOR ALL USING (auth.uid() = user_id OR auth.uid()::text = delegated_to OR auth.uid() = delegated_by);

CREATE POLICY "Users can manage their own notifications" ON public.smart_notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification rules" ON public.notification_rules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email templates" ON public.email_templates
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quick responses" ON public.quick_responses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar events" ON public.calendar_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights" ON public.executive_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own message embeddings" ON public.message_embeddings
    FOR ALL USING (auth.uid() = user_id);

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_vip_contacts_updated_at BEFORE UPDATE ON public.vip_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegation_rules_updated_at BEFORE UPDATE ON public.delegation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegation_tasks_updated_at BEFORE UPDATE ON public.delegation_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_rules_updated_at BEFORE UPDATE ON public.notification_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_responses_updated_at BEFORE UPDATE ON public.quick_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for advanced features

-- Function to search messages by embedding similarity
CREATE OR REPLACE FUNCTION search_messages_by_embedding(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 20,
    user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
    id text,
    subject text,
    content text,
    sender text,
    channel text,
    created_at timestamptz,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT 
        m.id,
        m.subject,
        m.content,
        m.sender,
        m.channel,
        m.created_at,
        1 - (me.embedding <=> query_embedding) as similarity
    FROM public.messages m
    JOIN public.message_embeddings me ON m.id = me.message_id
    WHERE me.user_id = search_messages_by_embedding.user_id
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
    ORDER BY me.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to update team member workload
CREATE OR REPLACE FUNCTION update_team_member_workload(
    member_id uuid,
    workload_change integer
)
RETURNS void
LANGUAGE sql
AS $$
    UPDATE public.team_members 
    SET workload = jsonb_set(
        workload, 
        '{current}', 
        (COALESCE((workload->>'current')::integer, 0) + workload_change)::text::jsonb
    )
    WHERE id = member_id;
$$;

-- Function to get VIP interaction summary
CREATE OR REPLACE FUNCTION get_vip_interaction_summary(
    user_id uuid,
    days_back integer DEFAULT 30
)
RETURNS TABLE (
    vip_id uuid,
    vip_name text,
    vip_email text,
    importance text,
    last_interaction timestamptz,
    interaction_count bigint,
    needs_attention boolean
)
LANGUAGE sql STABLE
AS $$
    SELECT 
        vc.id as vip_id,
        vc.name as vip_name,
        vc.email as vip_email,
        vc.importance,
        MAX(m.created_at) as last_interaction,
        COUNT(m.id) as interaction_count,
        (MAX(m.created_at) < NOW() - INTERVAL '7 days' AND vc.importance IN ('board', 'investor', 'customer')) as needs_attention
    FROM public.vip_contacts vc
    LEFT JOIN public.messages m ON (m.sender_email = vc.email OR m.sender = vc.name)
        AND m.user_id = get_vip_interaction_summary.user_id
        AND m.created_at >= NOW() - INTERVAL '1 day' * days_back
    WHERE vc.user_id = get_vip_interaction_summary.user_id
    GROUP BY vc.id, vc.name, vc.email, vc.importance
    ORDER BY vc.importance DESC, last_interaction DESC NULLS LAST;
$$;

-- Function to generate executive insights
CREATE OR REPLACE FUNCTION generate_executive_insight(
    user_id uuid,
    insight_type text,
    title text,
    description text,
    data jsonb,
    confidence_score decimal DEFAULT 0.8
)
RETURNS uuid
LANGUAGE sql
AS $$
    INSERT INTO public.executive_insights (
        user_id,
        insight_type,
        title,
        description,
        data,
        confidence_score,
        business_impact,
        valid_until
    )
    VALUES (
        user_id,
        insight_type,
        title,
        description,
        data,
        confidence_score,
        CASE 
            WHEN confidence_score >= 0.9 THEN 'high'
            WHEN confidence_score >= 0.7 THEN 'medium'
            ELSE 'low'
        END,
        NOW() + INTERVAL '30 days'
    )
    RETURNING id;
$$;