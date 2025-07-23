-- Napoleon AI - Development Seed Data
-- This script creates sample data for development and testing

-- Insert sample users (these will be created automatically via auth triggers in real usage)
-- Note: In real usage, users are created via Supabase Auth, this is just for development
INSERT INTO public.users (id, email, name, role, avatar_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'john.executive@company.com', 'John Executive', 'CEO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('550e8400-e29b-41d4-a716-446655440001', 'sarah.cto@company.com', 'Sarah Chen', 'CTO', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150')
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO public.user_profiles (user_id, preferences, settings, onboarding_completed, subscription_status) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    '{"theme": "light", "notifications": {"email": true, "push": true, "digest": "daily"}, "timezone": "America/New_York"}',
    '{"autoArchive": 7, "priorityThreshold": 70, "vipAlerts": true}',
    true,
    'premium'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '{"theme": "dark", "notifications": {"email": true, "push": false, "digest": "weekly"}, "timezone": "America/Los_Angeles"}',
    '{"autoArchive": 14, "priorityThreshold": 60, "vipAlerts": true}',
    false,
    'trial'
  )
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample connected accounts
INSERT INTO public.connected_accounts (id, user_id, provider, account_id, account_email, account_name, status) VALUES 
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'gmail', 'john.executive@company.com', 'john.executive@company.com', 'John Executive', 'active'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'slack', 'U01234567', 'john.executive@company.com', 'John Executive', 'active'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'gmail', 'sarah.cto@company.com', 'sarah.cto@company.com', 'Sarah Chen', 'active')
ON CONFLICT (user_id, provider, account_id) DO NOTHING;

-- Insert VIP contacts
INSERT INTO public.vip_contacts (id, user_id, email, name, relationship_type, priority_level, notes) VALUES 
  ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'investor@venturegroup.com', 'Alex Johnson', 'investor', 10, 'Lead investor from Series A round'),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'board.member@company.com', 'Maria Rodriguez', 'board', 9, 'Board chair, former Fortune 500 CEO'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'client@bigcorp.com', 'David Wilson', 'client', 8, 'CEO of our largest enterprise client'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'partner@strategic.com', 'Lisa Park', 'partner', 7, 'Strategic partnership lead'),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'engineer@company.com', 'Mike Thompson', 'team', 6, 'Senior engineering lead')
ON CONFLICT (user_id, email) DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (id, user_id, source, external_id, subject, content, sender_email, sender_name, priority_score, ai_summary, sentiment, is_vip, status, message_date) VALUES 
  (
    '880e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'gmail',
    'msg_001',
    'Q4 Board Meeting Preparation',
    'Hi John, I wanted to touch base about the upcoming Q4 board meeting. We need to finalize the slides and prepare for the investor presentation. The financial projections look strong, but we should discuss the competitive landscape section. Let me know when you have 30 minutes to review.',
    'board.member@company.com',
    'Maria Rodriguez',
    92,
    'Board member requesting review of Q4 board meeting materials and financial projections. Needs 30-minute discussion about competitive landscape.',
    'neutral',
    true,
    'unread',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'slack',
    'msg_002',
    'Engineering Team Status Update',
    'Quick update: The new feature deployment went smoothly last night. Performance metrics are looking good, 15% improvement in response times. The team is ready to move forward with the next sprint. Any blockers on your end?',
    'sarah.cto@company.com',
    'Sarah Chen',
    75,
    'Positive update on feature deployment with 15% performance improvement. Team ready for next sprint, asking about potential blockers.',
    'positive',
    false,
    'read',
    NOW() - INTERVAL '4 hours'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'gmail',
    'msg_003',
    'URGENT: Contract Renewal Discussion',
    'John, we need to discuss the contract renewal ASAP. The current terms expire next month and there are some pricing concerns from our legal team. This is a critical revenue stream that we cannot afford to lose. Can we schedule a call today?',
    'client@bigcorp.com',
    'David Wilson',
    95,
    'Urgent contract renewal discussion needed before next month expiration. Pricing concerns from legal team, critical revenue at risk.',
    'urgent',
    true,
    'unread',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'gmail',
    'msg_004',
    'Partnership Opportunity - Strategic Alliance',
    'Hi John, Following up on our conversation last week about the strategic partnership. Our team has prepared a proposal that could significantly expand our market reach. The partnership would involve co-marketing and technology integration. I have attached the initial proposal for your review.',
    'partner@strategic.com',
    'Lisa Park',
    80,
    'Follow-up on strategic partnership discussion with proposal for co-marketing and technology integration to expand market reach.',
    'positive',
    true,
    'unread',
    NOW() - INTERVAL '6 hours'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    'slack',
    'msg_005',
    'Weekly Investor Update Draft',
    'John, I have prepared the draft for this week investor update. Key highlights include 25% growth in user acquisition and successful product launch. Should I send it out to the investor list or do you want to review first?',
    'analyst@company.com',
    'Emily Davis',
    70,
    'Weekly investor update draft ready with 25% user acquisition growth and product launch highlights. Requesting review approval.',
    'neutral',
    false,
    'unread',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (user_id, source, external_id) DO NOTHING;

-- Insert sample action items
INSERT INTO public.action_items (id, message_id, user_id, description, due_date, priority, status, assigned_to) VALUES 
  (
    '990e8400-e29b-41d4-a716-446655440000',
    '880e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'Review Q4 board meeting slides and competitive landscape section',
    NOW() + INTERVAL '2 days',
    'high',
    'pending',
    'John Executive'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'Schedule 30-minute meeting with Maria Rodriguez',
    NOW() + INTERVAL '1 day',
    'high',
    'pending',
    'John Executive'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Schedule urgent call with David Wilson about contract renewal',
    NOW() + INTERVAL '4 hours',
    'urgent',
    'pending',
    'John Executive'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Review contract terms and pricing concerns with legal team',
    NOW() + INTERVAL '1 day',
    'urgent',
    'pending',
    'John Executive'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440004',
    '880e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'Review strategic partnership proposal from Lisa Park',
    NOW() + INTERVAL '3 days',
    'medium',
    'pending',
    'John Executive'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440005',
    '880e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    'Review and approve weekly investor update draft',
    NOW() + INTERVAL '1 day',
    'medium',
    'pending',
    'John Executive'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert relationship insights
INSERT INTO public.relationship_insights (id, user_id, contact_email, last_contact, interaction_frequency, sentiment_score, follow_up_needed, insights) VALUES 
  (
    'aa0e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'board.member@company.com',
    NOW() - INTERVAL '2 hours',
    8,
    0.85,
    true,
    '{"communication_style": "direct and professional", "preferred_meeting_time": "mornings", "key_interests": ["financial performance", "strategic direction"], "last_topics": ["board meeting preparation", "Q4 results"]}'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'client@bigcorp.com',
    NOW() - INTERVAL '1 hour',
    12,
    0.65,
    true,
    '{"communication_style": "urgent and direct", "preferred_meeting_time": "afternoons", "key_interests": ["contract terms", "pricing", "service quality"], "last_topics": ["contract renewal", "pricing concerns"]}'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'investor@venturegroup.com',
    NOW() - INTERVAL '1 week',
    4,
    0.90,
    false,
    '{"communication_style": "collaborative and strategic", "preferred_meeting_time": "flexible", "key_interests": ["growth metrics", "market expansion", "competitive advantage"], "last_topics": ["Q3 performance", "market opportunities"]}'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'partner@strategic.com',
    NOW() - INTERVAL '6 hours',
    6,
    0.80,
    false,
    '{"communication_style": "detail-oriented and thorough", "preferred_meeting_time": "late morning", "key_interests": ["partnership opportunities", "technology integration", "market reach"], "last_topics": ["strategic alliance", "co-marketing"]}'
  )
ON CONFLICT (user_id, contact_email) DO NOTHING;

-- Update user profiles with VIP contact references
UPDATE public.user_profiles 
SET vip_contacts = '[
  "investor@venturegroup.com",
  "board.member@company.com", 
  "client@bigcorp.com",
  "partner@strategic.com"
]'::jsonb
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

UPDATE public.user_profiles 
SET vip_contacts = '[
  "engineer@company.com"
]'::jsonb  
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';