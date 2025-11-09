// German Stripe Payment Intent Edge Function for MullerFuhrerschein
// Creates payment intents with German VAT handling and proper localization

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get request data
    const requestData = await req.json();
    const { 
      applicationId, 
      amountNet, 
      amountGross, 
      vatRate = 19.00,
      paymentMethod = 'card',
      licenseType = 'B'
    } = requestData;

    // Validate required parameters
    if (!applicationId || !amountNet || !amountGross) {
      throw new Error('Fehlende erforderliche Parameter: applicationId, amountNet, amountGross');
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert');
    }

    // Calculate VAT amount
    const vatAmount = amountGross - amountNet;
    
    // Create payment intent metadata for German compliance
    const metadata = {
      application_id: applicationId,
      license_type: licenseType,
      amount_net_eur: amountNet.toString(),
      amount_gross_eur: amountGross.toString(),
      vat_amount_eur: vatAmount.toString(),
      vat_rate: vatRate.toString(),
      country: 'DE',
      currency: 'EUR',
      service_type: 'fahrerlaubnis',
      compliance_gdpr: 'true',
      invoice_required: 'true'
    };

    // Create payment intent with German-specific settings
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'payment_intent',
      amount: amountGross, // Stripe expects gross amount in cents
      amount_net: amountNet,
      amount_vat: vatAmount,
      currency: 'eur',
      payment_method_types: ['card'],
      status: 'requires_payment_method',
      metadata: metadata,
      description: `Führerschein-Antrag ${licenseType} - MüllerFuhrerschein`,
      receipt_email: null,
      created: Math.floor(Date.now() / 1000)
    };

    // Simulate Stripe API response (in real implementation, this would call Stripe API)
    // For production, replace with actual Stripe API call using fetch
    const response = {
      id: paymentIntent.id,
      client_secret: `pi_${paymentIntent.id}_secret_${Math.random().toString(36).substr(2, 16)}`,
      amount: paymentIntent.amount,
      currency: 'eur',
      status: 'requires_payment_method',
      metadata: metadata
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Payment intent error:', error.message);
    
    const errorResponse = {
      error: {
        code: 'PAYMENT_INTENT_ERROR',
        message: `Fehler bei der Zahlungsvorbereitung: ${error.message}`,
        type: 'server_error'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
