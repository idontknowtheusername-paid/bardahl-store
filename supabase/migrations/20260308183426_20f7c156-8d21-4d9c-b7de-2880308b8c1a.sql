UPDATE oil_change_reminders 
SET next_reminder_date = (now() + interval '5 days'), 
    alerts_sent = '{}' 
WHERE id = 'c9eed0d5-d39d-4fae-8309-cef99cdbfb25';