import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pybvwtzybgogsxyibocd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnZ3dHp5YmdvZ3N4eWlib2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjUwMjAsImV4cCI6MjA4NTU0MTAyMH0.kz9MHXGJhLEvyBFiNBAGzEir8UKccATBJsa5Qomlj7I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategories() {
  console.log('🔄 Updating categories...\n');

  // 1. Update "Culottes" to "Culottes & Strings"
  console.log('1️⃣ Renaming "Culottes" to "Culottes & Strings"...');
  const { data: updateData, error: updateError } = await supabase
    .from('categories')
    .update({
      title: 'Culottes & Strings',
      description: 'Culottes, strings et bas de lingerie',
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'culottes')
    .select();

  if (updateError) {
    console.error('❌ Error updating category:', updateError);
  } else {
    console.log('✅ Category updated:', updateData);
  }

  // 2. Add new "Shorts & Boxers" category
  console.log('\n2️⃣ Adding "Shorts & Boxers" category...');
  const { data: insertData, error: insertError } = await supabase
    .from('categories')
    .insert({
      title: 'Shorts & Boxers',
      slug: 'shorts-boxers',
      description: 'Shorts, boxers et sous-vêtements confort',
      display_order: 7,
      is_active: true
    })
    .select();

  if (insertError) {
    console.error('❌ Error inserting category:', insertError);
  } else {
    console.log('✅ Category added:', insertData);
  }

  // 3. Display all categories
  console.log('\n📋 All categories:');
  const { data: allCategories, error: listError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (listError) {
    console.error('❌ Error listing categories:', listError);
  } else {
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.title} (${cat.slug})`);
    });
  }

  console.log('\n✅ Done!');
}

updateCategories().catch(console.error);
