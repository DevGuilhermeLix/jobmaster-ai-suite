import { supabase } from "@/integrations/supabase/client";

export interface UserPaymentInfo {
  id: string;
  email: string;
  is_paid: boolean | null;
  plan: string | null;
  usage_count: number;
  renew_at: string | null;
  created_at: string | null;
}

export interface PaywallResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Get user payment information from database
 */
export async function getUser(userId: string): Promise<UserPaymentInfo | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as UserPaymentInfo;
}

/**
 * Set user as paid with a specific plan
 */
export async function setPaid(email: string, plan: "mensal" | "anual"): Promise<void> {
  const renewDate = new Date();
  renewDate.setDate(renewDate.getDate() + (plan === "anual" ? 365 : 30));

  const { error } = await supabase
    .from("users")
    .update({
      is_paid: true,
      plan,
      renew_at: renewDate.toISOString(),
    })
    .eq("email", email);

  if (error) {
    console.error("Error setting user as paid:", error);
    throw error;
  }
}

/**
 * Check if user can access paid features (paywall verification)
 * Includes fair use policy check
 */
export async function checkPaywall(userId: string): Promise<PaywallResult> {
  const user = await getUser(userId);

  if (!user) {
    return { allowed: false, reason: "Usuário não encontrado." };
  }

  if (!user.is_paid) {
    return { allowed: false, reason: "Plano necessário para acessar esta funcionalidade." };
  }

  // Fair use check: limit to 20 uses
  if (user.usage_count >= 20) {
    return { 
      allowed: false, 
      reason: "Limite temporário de uso atingido. Tente novamente mais tarde." 
    };
  }

  // Increment usage count
  const { error } = await supabase
    .from("users")
    .update({ usage_count: user.usage_count + 1 })
    .eq("id", userId);

  if (error) {
    console.error("Error updating usage count:", error);
    return { allowed: false, reason: "Erro ao atualizar contador de uso." };
  }

  return { allowed: true };
}

/**
 * Reset usage count for a user (called when renew_at is reached)
 */
export async function resetUsageCount(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ usage_count: 0 })
    .eq("id", userId);

  if (error) {
    console.error("Error resetting usage count:", error);
    throw error;
  }
}

/**
 * Record a payment in the payments table
 */
export async function recordPayment(
  userId: string,
  plan: "mensal" | "anual",
  amount: number
): Promise<void> {
  const { error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      plan,
      amount,
      origem: "cakto",
    });

  if (error) {
    console.error("Error recording payment:", error);
    throw error;
  }
}
