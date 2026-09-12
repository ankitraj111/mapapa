INSERT INTO prompt_version (id, name, version, purpose, system_instructions, variables, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'lead_qualification', 1, 'Qualify inbound leads based on business rules', 
'You are an AI Sales Employee for {{company_name}}. Your goal is to qualify inbound leads. 
Business context: {{business_context}}
Lead information collected so far: {{lead_info}}
Conversation history: {{conversation_history}}
Ask the next most important qualification question. If the lead is already qualified based on the information, say so and offer to book a meeting.
Never invent pricing or make promises not in the business context.
Respond in a {{ai_tone}} tone. Keep responses concise and professional.', 
'["company_name","business_context","lead_info","conversation_history","ai_tone"]', true, NOW(), NOW()),

(gen_random_uuid(), 'lead_response', 1, 'Generate initial response to new inbound lead',
'You are an AI Sales Employee for {{company_name}}.
Business context: {{business_context}}
A new lead has just contacted you: {{lead_info}}
Generate a warm, professional initial response that:
1. Acknowledges their inquiry
2. Briefly confirms you can help
3. Asks the single most important qualification question
Keep it concise. Respond in a {{ai_tone}} tone.',
'["company_name","business_context","lead_info","ai_tone"]', true, NOW(), NOW()),

(gen_random_uuid(), 'daily_summary', 1, 'Generate daily business summary',
'Generate a concise daily summary for {{company_name}} based on this data:
{{summary_data}}
Write 4-6 sentences. Highlight wins, concerns, and recommended actions. Be specific with numbers.',
'["company_name","summary_data"]', true, NOW(), NOW()),

(gen_random_uuid(), 'escalation_check', 1, 'Determine if lead needs human escalation',
'You are evaluating whether this customer message requires human escalation.
Business escalation rules: {{escalation_rules}}
Customer message: {{customer_message}}
Conversation context: {{conversation_history}}
Respond with JSON: {"should_escalate": boolean, "reason": string, "urgency": "LOW|MEDIUM|HIGH"}',
'["escalation_rules","customer_message","conversation_history"]', true, NOW(), NOW());

INSERT INTO follow_up_sequence (id, tenant_id, name, is_active, stop_on_reply, stop_on_booking, max_follow_ups, created_at)
SELECT gen_random_uuid(), id, 'Default Follow-up Sequence', true, true, true, 4, NOW() FROM tenant;

INSERT INTO follow_up_step (id, sequence_id, step_number, delay_hours, message_template, channel, created_at)
SELECT gen_random_uuid(), fs.id, 1, 24, 'Hi {{lead_first_name}}, I wanted to follow up on your inquiry about {{requirement}}. Do you have any questions I can help with?', 'EMAIL', NOW()
FROM follow_up_sequence fs;

INSERT INTO follow_up_step (id, sequence_id, step_number, delay_hours, message_template, channel, created_at)
SELECT gen_random_uuid(), fs.id, 2, 72, 'Hi {{lead_first_name}}, just checking in again. We have helped many businesses like yours with {{requirement}}. Would you like to schedule a quick call?', 'EMAIL', NOW()
FROM follow_up_sequence fs;

INSERT INTO follow_up_step (id, sequence_id, step_number, delay_hours, message_template, channel, created_at)
SELECT gen_random_uuid(), fs.id, 3, 168, 'Hi {{lead_first_name}}, this is my final follow-up. If you are still interested in {{requirement}}, I would love to connect. Otherwise, feel free to reach out anytime.', 'EMAIL', NOW()
FROM follow_up_sequence fs;
