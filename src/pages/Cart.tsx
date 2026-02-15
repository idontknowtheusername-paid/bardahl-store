import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  const shippingCost = subtotal >= 80 ? 0 : 5.90;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container max-w-2xl text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="font-serif text-3xl font-medium mb-4">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Découvrez notre gamme de produits et trouvez ceux qui correspondent à vos besoins.
          </p>
          <Button variant="rose" size="lg" asChild>
            <Link to="/collections">Découvrir nos collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-8">
          Votre Panier
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}-${item.cupSize}`}
                className="flex gap-4 p-4 bg-card rounded-lg border border-border animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/produits/${item.product.slug}`} className="shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-28 md:w-32 md:h-36 object-cover rounded-md"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/produits/${item.product.slug}`}
                        className="font-medium hover:text-rose transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.color} • Taille {item.size}
                        {item.cupSize && ` • Bonnet ${item.cupSize}`}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        removeItem(item.product.id, item.size, item.color, item.cupSize)
                      }
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.color,
                            item.quantity - 1,
                            item.cupSize
                          )
                        }
                        className="p-1.5 border border-border rounded hover:bg-muted transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.color,
                            item.quantity + 1,
                            item.cupSize
                          )
                        }
                        className="p-1.5 border border-border rounded hover:bg-muted transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-medium text-rose">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-muted p-6 rounded-lg sticky top-24">
              <h2 className="font-serif text-xl font-medium mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      `${shippingCost.toFixed(2)} €`
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground bg-rose-light p-2 rounded">
                    Plus que <strong>{(80 - subtotal).toFixed(2)} €</strong> pour bénéficier de la livraison gratuite !
                  </p>
                )}
              </div>

              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <Button
                variant="rose"
                size="lg"
                className="w-full mt-6"
                asChild
              >
                <Link to="/checkout">Passer commande</Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Paiement sécurisé via Lygos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
