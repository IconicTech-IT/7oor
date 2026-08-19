-- Checkout offers InstaPay/Vodafone Cash/other-wallet payment and demands a transfer
-- screenshot, but never showed the account to transfer TO anywhere — every non-cash
-- order was unwinnable. Seed an empty row the admin fills in via Admin -> Settings;
-- checkout only shows a method's details once the admin has actually set them.
insert into settings (key, value)
values ('payment_info', '{"instapay": "", "vodafone_cash": "", "other_wallet_note": ""}'::jsonb)
on conflict (key) do nothing;
