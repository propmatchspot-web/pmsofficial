import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bolltbelnkxrosiudosi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbGx0YmVsbmt4cm9zaXVkb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTIxNDYsImV4cCI6MjA4MjI4ODE0Nn0.z8qyPf9engFTRQ4McZQldcyuI-0Ie7vPS4JnBVbWXj8'
);

async function checkData() {
  console.log('Fetching active firms...');
  const { data: firms, error: fErr } = await supabase.from('firms').select('id, name');
  console.log('Total Firms:', firms?.length);

  if (firms && firms.length > 0) {
    console.log('Fetching reviews WITHOUT profiles for firm:', firms[0].name);
    const { data: r1, error: e1 } = await supabase.from('reviews').select('*').eq('firm_id', firms[0].id);
    console.log('Reviews count:', r1?.length, 'Error:', e1);

    console.log('Fetching reviews WITH profiles for firm:', firms[0].name);
    const { data: r2, error: e2 } = await supabase.from('reviews').select('*, profiles(full_name)').eq('firm_id', firms[0].id);
    console.log('Reviews array length:', r2?.length, 'Error:', e2);
  } else {
    console.log("NO FIRMS FOUND IN DATABASE.");
  }
}

checkData();
