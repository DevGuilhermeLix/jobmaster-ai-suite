-- Add payment-related columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('mensal', 'anual')),
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS renew_at timestamp with time zone;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL CHECK (plan IN ('mensal', 'anual')),
  amount decimal(10,2) NOT NULL,
  origem text DEFAULT 'cakto',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update users RLS to allow updates on payment fields
CREATE POLICY "Users can update own payment info"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);