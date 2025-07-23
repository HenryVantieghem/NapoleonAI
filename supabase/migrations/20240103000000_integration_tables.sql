-- Integration and synchronization tables for Napoleon AI

-- User integrations (OAuth connections)
CREATE TABLE public.user_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scope TEXT[],
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, platform)
);

-- User synchronization status
CREATE TABLE public.user_sync_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams', 'all')),
    last_sync_at TIMESTAMPTZ,
    last_message_timestamp TIMESTAMPTZ,
    messages_synced INTEGER DEFAULT 0,
    sync_cursor TEXT, -- Platform-specific cursor/token for incremental sync
    sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'paused')),
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    channels_synced TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, platform)
);

-- Integration webhooks and subscriptions
CREATE TABLE public.integration_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams')),
    webhook_url TEXT NOT NULL,
    subscription_id TEXT, -- Platform-specific subscription ID
    secret_token TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_notification_at TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, platform)
);

-- API rate limiting tracking
CREATE TABLE public.api_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams', 'openai')),
    endpoint TEXT,
    requests_made INTEGER DEFAULT 0,
    requests_limit INTEGER NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    reset_at TIMESTAMPTZ,
    is_throttled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, platform, endpoint, window_start)
);

-- Message synchronization queue
CREATE TABLE public.message_sync_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams')),
    external_message_id TEXT NOT NULL,
    external_thread_id TEXT,
    channel_id TEXT,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Integration analytics and metrics
CREATE TABLE public.integration_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams')),
    messages_fetched INTEGER DEFAULT 0,
    messages_processed INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    rate_limit_hits INTEGER DEFAULT 0,
    sync_duration_ms INTEGER DEFAULT 0,
    avg_processing_time_ms INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    webhook_notifications INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, date, platform)
);

-- Platform-specific connection details
CREATE TABLE public.platform_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('gmail', 'slack', 'teams')),
    
    -- Gmail specific fields
    gmail_email TEXT,
    gmail_history_id TEXT,
    gmail_watch_expiration TIMESTAMPTZ,
    
    -- Slack specific fields
    slack_team_id TEXT,
    slack_team_name TEXT,
    slack_user_id TEXT,
    slack_bot_token TEXT,
    
    -- Teams specific fields
    teams_tenant_id TEXT,
    teams_user_id TEXT,
    teams_organization TEXT,
    
    -- Common fields
    account_name TEXT,
    account_email TEXT,
    permissions TEXT[],
    connection_metadata JSONB DEFAULT '{}',
    last_validated_at TIMESTAMPTZ,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX idx_user_integrations_platform ON public.user_integrations(platform);
CREATE INDEX idx_user_integrations_active ON public.user_integrations(is_active);

CREATE INDEX idx_user_sync_status_user_id ON public.user_sync_status(user_id);
CREATE INDEX idx_user_sync_status_platform ON public.user_sync_status(platform);
CREATE INDEX idx_user_sync_status_status ON public.user_sync_status(sync_status);
CREATE INDEX idx_user_sync_status_last_sync ON public.user_sync_status(last_sync_at);

CREATE INDEX idx_integration_webhooks_user_id ON public.integration_webhooks(user_id);
CREATE INDEX idx_integration_webhooks_platform ON public.integration_webhooks(platform);
CREATE INDEX idx_integration_webhooks_active ON public.integration_webhooks(is_active);

CREATE INDEX idx_api_rate_limits_user_platform ON public.api_rate_limits(user_id, platform);
CREATE INDEX idx_api_rate_limits_window ON public.api_rate_limits(window_start, window_end);
CREATE INDEX idx_api_rate_limits_throttled ON public.api_rate_limits(is_throttled);

CREATE INDEX idx_message_sync_queue_user_id ON public.message_sync_queue(user_id);
CREATE INDEX idx_message_sync_queue_status ON public.message_sync_queue(status);
CREATE INDEX idx_message_sync_queue_priority ON public.message_sync_queue(priority);
CREATE INDEX idx_message_sync_queue_scheduled ON public.message_sync_queue(scheduled_at);
CREATE INDEX idx_message_sync_queue_platform ON public.message_sync_queue(platform);

CREATE INDEX idx_integration_metrics_user_date ON public.integration_metrics(user_id, date);
CREATE INDEX idx_integration_metrics_platform ON public.integration_metrics(platform);

CREATE INDEX idx_platform_connections_integration_id ON public.platform_connections(user_integration_id);
CREATE INDEX idx_platform_connections_platform ON public.platform_connections(platform);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage their own integrations" ON public.user_integrations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync status" ON public.user_sync_status
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own webhooks" ON public.integration_webhooks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rate limits" ON public.api_rate_limits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync queue" ON public.message_sync_queue
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own integration metrics" ON public.integration_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own platform connections" ON public.platform_connections
    FOR ALL USING (
        user_integration_id IN (
            SELECT id FROM public.user_integrations WHERE user_id = auth.uid()
        )
    );

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON public.user_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sync_status_updated_at BEFORE UPDATE ON public.user_sync_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_webhooks_updated_at BEFORE UPDATE ON public.integration_webhooks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON public.platform_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.api_rate_limits 
    WHERE window_end < now() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to process message sync queue
CREATE OR REPLACE FUNCTION process_message_sync_queue()
RETURNS TABLE(
    processed_count INTEGER,
    failed_count INTEGER,
    pending_count INTEGER
) AS $$
DECLARE
    processed INTEGER := 0;
    failed INTEGER := 0;
    pending INTEGER;
    queue_item RECORD;
BEGIN
    -- Get pending items ordered by priority and scheduled time
    FOR queue_item IN 
        SELECT id, user_id, platform, external_message_id, operation, retry_count, max_retries, payload
        FROM public.message_sync_queue 
        WHERE status = 'pending' 
        AND scheduled_at <= now()
        ORDER BY priority DESC, scheduled_at ASC
        LIMIT 100
    LOOP
        BEGIN
            -- Mark as processing
            UPDATE public.message_sync_queue 
            SET status = 'processing' 
            WHERE id = queue_item.id;
            
            -- Here you would call the appropriate sync function
            -- For now, we'll just mark as completed
            UPDATE public.message_sync_queue 
            SET 
                status = 'completed',
                processed_at = now()
            WHERE id = queue_item.id;
            
            processed := processed + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Handle failure
            UPDATE public.message_sync_queue 
            SET 
                status = CASE 
                    WHEN retry_count >= max_retries THEN 'failed'
                    ELSE 'pending'
                END,
                retry_count = retry_count + 1,
                scheduled_at = CASE 
                    WHEN retry_count < max_retries THEN now() + INTERVAL '5 minutes' * (retry_count + 1)
                    ELSE scheduled_at
                END,
                error_message = SQLERRM
            WHERE id = queue_item.id;
            
            failed := failed + 1;
        END;
    END LOOP;
    
    -- Count remaining pending items
    SELECT COUNT(*) INTO pending 
    FROM public.message_sync_queue 
    WHERE status = 'pending';
    
    RETURN QUERY SELECT processed, failed, pending;
END;
$$ LANGUAGE plpgsql;

-- Function to update integration metrics
CREATE OR REPLACE FUNCTION update_integration_metrics(
    p_user_id UUID,
    p_platform TEXT,
    p_messages_fetched INTEGER DEFAULT 0,
    p_messages_processed INTEGER DEFAULT 0,
    p_messages_failed INTEGER DEFAULT 0,
    p_api_calls_made INTEGER DEFAULT 0,
    p_rate_limit_hits INTEGER DEFAULT 0,
    p_sync_duration_ms INTEGER DEFAULT 0,
    p_error_count INTEGER DEFAULT 0,
    p_webhook_notifications INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.integration_metrics (
        user_id,
        date,
        platform,
        messages_fetched,
        messages_processed,
        messages_failed,
        api_calls_made,
        rate_limit_hits,
        sync_duration_ms,
        error_count,
        webhook_notifications
    )
    VALUES (
        p_user_id,
        CURRENT_DATE,
        p_platform,
        p_messages_fetched,
        p_messages_processed,
        p_messages_failed,
        p_api_calls_made,
        p_rate_limit_hits,
        p_sync_duration_ms,
        p_error_count,
        p_webhook_notifications
    )
    ON CONFLICT (user_id, date, platform) 
    DO UPDATE SET
        messages_fetched = integration_metrics.messages_fetched + p_messages_fetched,
        messages_processed = integration_metrics.messages_processed + p_messages_processed,
        messages_failed = integration_metrics.messages_failed + p_messages_failed,
        api_calls_made = integration_metrics.api_calls_made + p_api_calls_made,
        rate_limit_hits = integration_metrics.rate_limit_hits + p_rate_limit_hits,
        sync_duration_ms = integration_metrics.sync_duration_ms + p_sync_duration_ms,
        error_count = integration_metrics.error_count + p_error_count,
        webhook_notifications = integration_metrics.webhook_notifications + p_webhook_notifications;
END;
$$ LANGUAGE plpgsql;