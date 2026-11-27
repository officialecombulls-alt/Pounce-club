import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products/:handle", "routes/product.tsx"),
  route("lp/:handle", "routes/lp.tsx"),
  route("collections", "routes/collections.tsx"),
  route("collections/:handle", "routes/collection.tsx"),
  route("cart", "routes/cart.tsx"),
  route("search", "routes/search.tsx"),
  route("account", "routes/account.tsx"),
  route("policies/:handle", "routes/policy.tsx"),
  route("contact", "routes/contact.tsx"),
  route("robots.txt", "routes/robots.ts"),
  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;
