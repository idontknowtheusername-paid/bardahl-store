// Test des emails transactionnels
const SUPABASE_URL = "https://ybjvncrqhcrsoijtxawp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlianZuY3JxaGNyc29panR4YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjM4NTMsImV4cCI6MjA4NjU5OTg1M30.5RLQSwULOFMFjhv1GwLfBMtllsZ1ubMbDZri_Hir8F8";

async function testEmail(template, to, subject, data) {
  console.log(`\n🧪 Test: ${template}`);
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, template, data }),
  });

  const result = await response.json();
  console.log(response.ok ? `✅ Envoyé: ${result.messageId}` : `❌ Erreur: ${result.error}`);
  return result;
}

// Test avec n'importe quelle adresse maintenant
const TEST_EMAIL = "bienvenu082003@gmail.com";

async function runTests() {
  console.log("🚀 Test des emails transactionnels Bardahl\n");
  
  // Test 1: Confirmation de commande
  await testEmail(
    "order_confirmation",
    TEST_EMAIL,
    "Confirmation de commande - Bardahl",
    {
      customerName: "Jean Dupont",
      orderNumber: "CMD-123456",
      total: "25000"
    }
  );

  // Test 2: Commande expédiée
  await testEmail(
    "order_shipped",
    TEST_EMAIL,
    "Votre commande a été expédiée - Bardahl",
    {
      customerName: "Jean Dupont",
      orderNumber: "CMD-123456",
      trackingNumber: "TRACK-789"
    }
  );

  // Test 3: Newsletter
  await testEmail(
    "newsletter_welcome",
    TEST_EMAIL,
    "Bienvenue chez Bardahl",
    {
      name: "Jean"
    }
  );

  console.log("\n✨ Tests terminés");
}

runTests().catch(console.error);
