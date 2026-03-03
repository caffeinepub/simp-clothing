import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";

actor {
  type Product = {
    id : Nat;
    name : Text;
    priceCents : Nat;
    category : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = [
    {
      id = 1;
      name = "SIMPLExCORD Hoodie";
      priceCents = 5995;
      category = "hoodie";
    },
    {
      id = 2;
      name = "Street Dreams Tee";
      priceCents = 2495;
      category = "tee";
    },
    {
      id = 3;
      name = "Utility Cargo Pants";
      priceCents = 4495;
      category = "pants";
    },
    {
      id = 4;
      name = "Embroidered Beanie";
      priceCents = 1495;
      category = "accessories";
    },
    {
      id = 5;
      name = "Simp Standard Crewneck";
      priceCents = 3995;
      category = "crewneck";
    },
    {
      id = 6;
      name = "Minimalist Track Shorts";
      priceCents = 2995;
      category = "shorts";
    },
  ];

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.filter(func(product) { Text.equal(product.category, category) });
  };
};
