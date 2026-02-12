CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
CREATE TABLE "pages_locales" (
CREATE TABLE "_pages_v_locales" (
CREATE TABLE "products_variants" (
CREATE TABLE "products_locales" (
CREATE TABLE "product_collections" (
CREATE TABLE "product_collections_rels" (
CREATE TABLE "shipping_zones_countries" (
CREATE TABLE "shipping_zones_cities" (
CREATE TABLE "shipping_zones" (
CREATE TABLE "shipping_rates" (
CREATE TABLE "newsletter_subscribers" (
CREATE TABLE "contact_messages" (
CREATE TABLE "forms_blocks_checkbox_locales" (
CREATE TABLE "forms_blocks_country_locales" (
CREATE TABLE "forms_blocks_email_locales" (
CREATE TABLE "forms_blocks_message_locales" (
CREATE TABLE "forms_blocks_number_locales" (
CREATE TABLE "forms_blocks_select_options_locales" (
CREATE TABLE "forms_blocks_select_locales" (
CREATE TABLE "forms_blocks_state_locales" (
CREATE TABLE "forms_blocks_text_locales" (
CREATE TABLE "forms_blocks_textarea_locales" (
CREATE TABLE "forms_emails_locales" (
CREATE TABLE "forms_locales" (
CREATE TABLE "site_settings" (
CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('fr', 'en');
CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE "public"."enum_contact_messages_status" AS ENUM('new', 'in_progress', 'replied', 'closed');
CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
CREATE INDEX "products_meta_meta_image_idx" ON "products_locales" USING btree ("meta_image_id","_locale");
CREATE INDEX "product_collections_image_idx" ON "product_collections" USING btree ("image_id");
CREATE INDEX "product_collections_updated_at_idx" ON "product_collections" USING btree ("updated_at");
CREATE INDEX "product_collections_created_at_idx" ON "product_collections" USING btree ("created_at");
CREATE INDEX "product_collections_rels_order_idx" ON "product_collections_rels" USING btree ("order");
CREATE INDEX "product_collections_rels_parent_idx" ON "product_collections_rels" USING btree ("parent_id");
CREATE INDEX "product_collections_rels_path_idx" ON "product_collections_rels" USING btree ("path");
CREATE INDEX "product_collections_rels_products_id_idx" ON "product_collections_rels" USING btree ("products_id");
CREATE INDEX "shipping_zones_countries_order_idx" ON "shipping_zones_countries" USING btree ("_order");
CREATE INDEX "shipping_zones_countries_parent_id_idx" ON "shipping_zones_countries" USING btree ("_parent_id");
CREATE INDEX "shipping_zones_cities_order_idx" ON "shipping_zones_cities" USING btree ("_order");
CREATE INDEX "shipping_zones_cities_parent_id_idx" ON "shipping_zones_cities" USING btree ("_parent_id");
CREATE INDEX "shipping_zones_updated_at_idx" ON "shipping_zones" USING btree ("updated_at");
CREATE INDEX "shipping_zones_created_at_idx" ON "shipping_zones" USING btree ("created_at");
CREATE INDEX "shipping_rates_shipping_zone_idx" ON "shipping_rates" USING btree ("shipping_zone_id");
CREATE INDEX "shipping_rates_updated_at_idx" ON "shipping_rates" USING btree ("updated_at");
CREATE INDEX "shipping_rates_created_at_idx" ON "shipping_rates" USING btree ("created_at");
CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
CREATE INDEX "products_rels_product_collections_id_idx" ON "products_rels" USING btree ("product_collections_id");
CREATE INDEX "orders_shipping_method_idx" ON "orders" USING btree ("shipping_method_id");
CREATE INDEX "payload_locked_documents_rels_product_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("product_collections_id");
CREATE INDEX "payload_locked_documents_rels_shipping_zones_id_idx" ON "payload_locked_documents_rels" USING btree ("shipping_zones_id");
CREATE INDEX "payload_locked_documents_rels_shipping_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("shipping_rates_id");
CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('products');
CREATE TYPE "public"."enum_pages_blocks_carousel_populate_by" AS ENUM('collection', 'selection');
CREATE TYPE "public"."enum_pages_blocks_carousel_relation_to" AS ENUM('products');
CREATE TYPE "public"."enum_pages_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('products');
CREATE TYPE "public"."enum__pages_v_blocks_carousel_populate_by" AS ENUM('collection', 'selection');
CREATE TYPE "public"."enum__pages_v_blocks_carousel_relation_to" AS ENUM('products');
CREATE TYPE "public"."enum__pages_v_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
CREATE TYPE "public"."enum_addresses_country" AS ENUM('US', 'GB', 'CA', 'AU', 'AT', 'BE', 'BR', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'IE', 'IT', 'JP', 'LV', 'LT', 'LU', 'MY', 'MT', 'MX', 'NL', 'NZ', 'NO', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH');
CREATE TYPE "public"."enum_variants_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__variants_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum_products_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum_products_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum_products_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
CREATE TYPE "public"."enum_products_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum_products_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum__products_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum_carts_currency" AS ENUM('USD');
CREATE TYPE "public"."enum_orders_currency" AS ENUM('USD');
CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('stripe');
CREATE TYPE "public"."enum_transactions_status" AS ENUM('pending', 'succeeded', 'failed', 'cancelled', 'expired', 'refunded');
CREATE TYPE "public"."enum_transactions_currency" AS ENUM('USD');
CREATE TABLE "pages_hero_links" (
CREATE TABLE "pages_blocks_cta_links" (
CREATE TABLE "pages_blocks_cta" (
CREATE TABLE "pages_blocks_content_columns" (
CREATE TABLE "pages_blocks_content" (
CREATE TABLE "pages_blocks_media_block" (
CREATE TABLE "pages_blocks_archive" (
CREATE TABLE "pages_blocks_carousel" (
CREATE TABLE "pages_blocks_three_item_grid" (
CREATE TABLE "pages_blocks_banner" (
CREATE TABLE "pages_blocks_form_block" (
CREATE TABLE "pages_rels" (
CREATE TABLE "_pages_v_version_hero_links" (
CREATE TABLE "_pages_v_blocks_cta_links" (
CREATE TABLE "_pages_v_blocks_cta" (
CREATE TABLE "_pages_v_blocks_content_columns" (
CREATE TABLE "_pages_v_blocks_content" (
CREATE TABLE "_pages_v_blocks_media_block" (
CREATE TABLE "_pages_v_blocks_archive" (
CREATE TABLE "_pages_v_blocks_carousel" (
CREATE TABLE "_pages_v_blocks_three_item_grid" (
CREATE TABLE "_pages_v_blocks_banner" (
CREATE TABLE "_pages_v_blocks_form_block" (
CREATE TABLE "_pages_v_rels" (
CREATE TABLE "addresses" (
CREATE TABLE "variants" (
CREATE TABLE "variants_rels" (
CREATE TABLE "_variants_v" (
CREATE TABLE "_variants_v_rels" (
CREATE TABLE "variant_types" (
CREATE TABLE "variant_options" (
CREATE TABLE "products_blocks_cta_links" (
CREATE TABLE "products_blocks_cta" (
CREATE TABLE "products_blocks_content_columns" (
CREATE TABLE "products_blocks_content" (
CREATE TABLE "products_blocks_media_block" (
CREATE TABLE "_products_v_version_gallery" (
CREATE TABLE "_products_v_blocks_cta_links" (
CREATE TABLE "_products_v_blocks_cta" (
CREATE TABLE "_products_v_blocks_content_columns" (
CREATE TABLE "_products_v_blocks_content" (
CREATE TABLE "_products_v_blocks_media_block" (
CREATE TABLE "_products_v" (
CREATE TABLE "_products_v_rels" (
CREATE TABLE "carts_items" (
CREATE TABLE "carts" (
CREATE TABLE "orders_rels" (
CREATE TABLE "transactions_items" (
CREATE TABLE "transactions" (
CREATE TYPE "public"."enum_orders_status" AS ENUM('processing', 'completed', 'cancelled', 'refunded');
CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
CREATE INDEX "pages_blocks_three_item_grid_order_idx" ON "pages_blocks_three_item_grid" USING btree ("_order");
CREATE INDEX "pages_blocks_three_item_grid_parent_id_idx" ON "pages_blocks_three_item_grid" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_three_item_grid_path_idx" ON "pages_blocks_three_item_grid" USING btree ("_path");
CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_three_item_grid_order_idx" ON "_pages_v_blocks_three_item_grid" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_three_item_grid_parent_id_idx" ON "_pages_v_blocks_three_item_grid" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_three_item_grid_path_idx" ON "_pages_v_blocks_three_item_grid" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
CREATE INDEX "addresses_customer_idx" ON "addresses" USING btree ("customer_id");
CREATE INDEX "addresses_updated_at_idx" ON "addresses" USING btree ("updated_at");
CREATE INDEX "addresses_created_at_idx" ON "addresses" USING btree ("created_at");
CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");
CREATE INDEX "variants_updated_at_idx" ON "variants" USING btree ("updated_at");
CREATE INDEX "variants_created_at_idx" ON "variants" USING btree ("created_at");
CREATE INDEX "variants_deleted_at_idx" ON "variants" USING btree ("deleted_at");
CREATE INDEX "variants__status_idx" ON "variants" USING btree ("_status");
CREATE INDEX "variants_rels_order_idx" ON "variants_rels" USING btree ("order");
CREATE INDEX "variants_rels_parent_idx" ON "variants_rels" USING btree ("parent_id");
CREATE INDEX "variants_rels_path_idx" ON "variants_rels" USING btree ("path");
CREATE INDEX "variants_rels_variant_options_id_idx" ON "variants_rels" USING btree ("variant_options_id");
CREATE INDEX "_variants_v_parent_idx" ON "_variants_v" USING btree ("parent_id");
CREATE INDEX "_variants_v_version_version_product_idx" ON "_variants_v" USING btree ("version_product_id");
CREATE INDEX "_variants_v_version_version_updated_at_idx" ON "_variants_v" USING btree ("version_updated_at");
CREATE INDEX "_variants_v_version_version_created_at_idx" ON "_variants_v" USING btree ("version_created_at");
CREATE INDEX "_variants_v_version_version_deleted_at_idx" ON "_variants_v" USING btree ("version_deleted_at");
CREATE INDEX "_variants_v_version_version__status_idx" ON "_variants_v" USING btree ("version__status");
CREATE INDEX "_variants_v_created_at_idx" ON "_variants_v" USING btree ("created_at");
CREATE INDEX "_variants_v_updated_at_idx" ON "_variants_v" USING btree ("updated_at");
CREATE INDEX "_variants_v_latest_idx" ON "_variants_v" USING btree ("latest");
CREATE INDEX "_variants_v_autosave_idx" ON "_variants_v" USING btree ("autosave");
CREATE INDEX "_variants_v_rels_order_idx" ON "_variants_v_rels" USING btree ("order");
CREATE INDEX "_variants_v_rels_parent_idx" ON "_variants_v_rels" USING btree ("parent_id");
CREATE INDEX "_variants_v_rels_path_idx" ON "_variants_v_rels" USING btree ("path");
CREATE INDEX "_variants_v_rels_variant_options_id_idx" ON "_variants_v_rels" USING btree ("variant_options_id");
CREATE INDEX "variant_types_updated_at_idx" ON "variant_types" USING btree ("updated_at");
CREATE INDEX "variant_types_created_at_idx" ON "variant_types" USING btree ("created_at");
CREATE INDEX "variant_types_deleted_at_idx" ON "variant_types" USING btree ("deleted_at");
CREATE INDEX "variant_options__variantoptions_options_order_idx" ON "variant_options" USING btree ("_variantoptions_options_order");
CREATE INDEX "variant_options_variant_type_idx" ON "variant_options" USING btree ("variant_type_id");
CREATE INDEX "variant_options_updated_at_idx" ON "variant_options" USING btree ("updated_at");
CREATE INDEX "variant_options_created_at_idx" ON "variant_options" USING btree ("created_at");
CREATE INDEX "variant_options_deleted_at_idx" ON "variant_options" USING btree ("deleted_at");
CREATE INDEX "products_blocks_cta_links_order_idx" ON "products_blocks_cta_links" USING btree ("_order");
CREATE INDEX "products_blocks_cta_links_parent_id_idx" ON "products_blocks_cta_links" USING btree ("_parent_id");
CREATE INDEX "products_blocks_cta_order_idx" ON "products_blocks_cta" USING btree ("_order");
CREATE INDEX "products_blocks_cta_parent_id_idx" ON "products_blocks_cta" USING btree ("_parent_id");
CREATE INDEX "products_blocks_cta_path_idx" ON "products_blocks_cta" USING btree ("_path");
CREATE INDEX "products_blocks_content_columns_order_idx" ON "products_blocks_content_columns" USING btree ("_order");
CREATE INDEX "products_blocks_content_columns_parent_id_idx" ON "products_blocks_content_columns" USING btree ("_parent_id");
CREATE INDEX "products_blocks_content_order_idx" ON "products_blocks_content" USING btree ("_order");
CREATE INDEX "products_blocks_content_parent_id_idx" ON "products_blocks_content" USING btree ("_parent_id");
CREATE INDEX "products_blocks_content_path_idx" ON "products_blocks_content" USING btree ("_path");
CREATE INDEX "products_blocks_media_block_order_idx" ON "products_blocks_media_block" USING btree ("_order");
CREATE INDEX "products_blocks_media_block_parent_id_idx" ON "products_blocks_media_block" USING btree ("_parent_id");
CREATE INDEX "products_blocks_media_block_path_idx" ON "products_blocks_media_block" USING btree ("_path");
CREATE INDEX "products_blocks_media_block_media_idx" ON "products_blocks_media_block" USING btree ("media_id");
CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
CREATE INDEX "_products_v_version_gallery_variant_option_idx" ON "_products_v_version_gallery" USING btree ("variant_option_id");
CREATE INDEX "_products_v_blocks_cta_links_order_idx" ON "_products_v_blocks_cta_links" USING btree ("_order");
CREATE INDEX "_products_v_blocks_cta_links_parent_id_idx" ON "_products_v_blocks_cta_links" USING btree ("_parent_id");
CREATE INDEX "_products_v_blocks_cta_order_idx" ON "_products_v_blocks_cta" USING btree ("_order");
CREATE INDEX "_products_v_blocks_cta_parent_id_idx" ON "_products_v_blocks_cta" USING btree ("_parent_id");
CREATE INDEX "_products_v_blocks_cta_path_idx" ON "_products_v_blocks_cta" USING btree ("_path");
CREATE INDEX "_products_v_blocks_content_columns_order_idx" ON "_products_v_blocks_content_columns" USING btree ("_order");
CREATE INDEX "_products_v_blocks_content_columns_parent_id_idx" ON "_products_v_blocks_content_columns" USING btree ("_parent_id");
CREATE INDEX "_products_v_blocks_content_order_idx" ON "_products_v_blocks_content" USING btree ("_order");
CREATE INDEX "_products_v_blocks_content_parent_id_idx" ON "_products_v_blocks_content" USING btree ("_parent_id");
CREATE INDEX "_products_v_blocks_content_path_idx" ON "_products_v_blocks_content" USING btree ("_path");
CREATE INDEX "_products_v_blocks_media_block_order_idx" ON "_products_v_blocks_media_block" USING btree ("_order");
CREATE INDEX "_products_v_blocks_media_block_parent_id_idx" ON "_products_v_blocks_media_block" USING btree ("_parent_id");
CREATE INDEX "_products_v_blocks_media_block_path_idx" ON "_products_v_blocks_media_block" USING btree ("_path");
CREATE INDEX "_products_v_blocks_media_block_media_idx" ON "_products_v_blocks_media_block" USING btree ("media_id");
CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
CREATE INDEX "_products_v_version_version_deleted_at_idx" ON "_products_v" USING btree ("version_deleted_at");
CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
CREATE INDEX "_products_v_rels_pages_id_idx" ON "_products_v_rels" USING btree ("pages_id");
CREATE INDEX "_products_v_rels_variant_types_id_idx" ON "_products_v_rels" USING btree ("variant_types_id");
CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
CREATE INDEX "carts_items_product_idx" ON "carts_items" USING btree ("product_id");
CREATE INDEX "carts_items_variant_idx" ON "carts_items" USING btree ("variant_id");
CREATE INDEX "carts_secret_idx" ON "carts" USING btree ("secret");
CREATE INDEX "carts_customer_idx" ON "carts" USING btree ("customer_id");
CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
CREATE INDEX "orders_rels_order_idx" ON "orders_rels" USING btree ("order");
CREATE INDEX "orders_rels_parent_idx" ON "orders_rels" USING btree ("parent_id");
CREATE INDEX "orders_rels_path_idx" ON "orders_rels" USING btree ("path");
CREATE INDEX "orders_rels_transactions_id_idx" ON "orders_rels" USING btree ("transactions_id");
CREATE INDEX "transactions_items_order_idx" ON "transactions_items" USING btree ("_order");
CREATE INDEX "transactions_items_parent_id_idx" ON "transactions_items" USING btree ("_parent_id");
CREATE INDEX "transactions_items_product_idx" ON "transactions_items" USING btree ("product_id");
CREATE INDEX "transactions_items_variant_idx" ON "transactions_items" USING btree ("variant_id");
CREATE INDEX "transactions_customer_idx" ON "transactions" USING btree ("customer_id");
CREATE INDEX "transactions_order_idx" ON "transactions" USING btree ("order_id");
CREATE INDEX "transactions_cart_idx" ON "transactions" USING btree ("cart_id");
CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
CREATE INDEX "products_gallery_variant_option_idx" ON "products_gallery" USING btree ("variant_option_id");
CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
CREATE INDEX "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
CREATE INDEX "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
CREATE INDEX "products_rels_variant_types_id_idx" ON "products_rels" USING btree ("variant_types_id");
CREATE INDEX "orders_items_variant_idx" ON "orders_items" USING btree ("variant_id");
CREATE INDEX "payload_locked_documents_rels_addresses_id_idx" ON "payload_locked_documents_rels" USING btree ("addresses_id");
CREATE INDEX "payload_locked_documents_rels_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("variants_id");
CREATE INDEX "payload_locked_documents_rels_variant_types_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_types_id");
CREATE INDEX "payload_locked_documents_rels_variant_options_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_options_id");
CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");
