import { User } from "../components/user";
import { Cart } from "../components/cart";
import CartDAO from "../dao/cartDAO";
import ProductDAO from "../dao/productDAO";
import { CartNotFoundError, EmptyCartError } from "../errors/cartError";
import {
	EmptyProductStockError,
	LowProductStockError,
} from "../errors/productError";
import { Time } from "../utilities";
/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
	private dao: CartDAO;
	private prod_dao: ProductDAO;

	constructor() {
		this.dao = new CartDAO();
		this.prod_dao = new ProductDAO();
	}

	/**
	 * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
	 * If the product is not in the cart, it should be added with a quantity of 1.
	 * If there is no current unpaid cart in the database, then a new cart should be created.
	 * @param user - The user to whom the product should be added.
	 * @param productId - The model of the product to add.
	 * @returns A Promise that resolves to `true` if the product was successfully added.
	 */
	async addToCart(user: User, product: string): Promise<boolean> {
		const full_product = await this.dao.getProduct(product);
		let cartid: number = undefined;
		try {
			cartid = await this.dao.getCurrentCartId(user);
		} catch (err) {
			if (err instanceof CartNotFoundError) {
				try {
					cartid = await this.dao.createCart(user);
				} catch (err) {
					console.log(err);
				}
			}
		}

		return this.dao.addProductToCart(cartid, full_product);
	}

	/**
	 * Retrieves the current cart for a specific user.
	 * @param user - The user for whom to retrieve the cart.
	 * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
	 */
	async getCart(user: User): Promise<Cart> {
		return new Promise((resolve, reject) => {
			this.dao
				.getCurrentCart(user)
				.then((cart) => resolve(cart))
				.catch((err) => {
					if (err === CartNotFoundError) {
						resolve(new Cart(user.username, false, "", 0, []));
					} else {
						console.log(err);
						reject(err);
					}
				});
		});
	}

	/**
	 * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
	 * @param user - The user whose cart should be checked out.
	 * @returns A Promise that resolves to `true` if the cart was successfully checked out.
	 *
	 */
	async checkoutCart(user: User): Promise<boolean> {
		let cart: Cart = undefined;
		cart = await this.dao.getCurrentCart(user);

		// Check availability of products
		let unavailable_product = false;
		let empty_stock: boolean;

		//console.log(cart);

		for (let product of cart.products) {
			let quantity = await this.prod_dao.getProductQuantity(
				product.model
			);
			//console.log(quantity);
			if (quantity === 0) {
				empty_stock = true;
				break;
			}
			if (quantity < product.quantity) {
				unavailable_product = true;
				break;
			}
		}

		return new Promise((resolve, reject) => {
			if (empty_stock) reject(new EmptyProductStockError());
			else if (unavailable_product) reject(new LowProductStockError());
			else if (cart.products.length === 0) {
				reject(new EmptyCartError());
			} else {
				// Process payment - always succeeds

				// decrease products quantity in stock
				cart.products.forEach(async (product) => {
					await this.prod_dao.decreaseQuantity(
						product.model,
						product.quantity,
						Time.now()
					);
				});

				this.dao
					.checkoutCart(user.username)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			}
		});
	}

	/**
	 * Retrieves all paid carts for a specific customer.
	 * @param user - The customer for whom to retrieve the carts.
	 * @returns A Promise that resolves to an array of carts belonging to the customer.
	 * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
	 */
	async getCustomerCarts(user: User): Promise<Cart[]> {
		const carts = await this.dao.fetchPaidCarts(user.username);
		for (let cart of carts) {
			cart.cart.products = await this.dao.fetchProducts(cart.id);
		}
		return carts.map((cart) => cart.cart);
	}

	/**
	 * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
	 * @param user The user who owns the cart.
	 * @param product The model of the product to remove.
	 * @returns A Promise that resolves to `true` if the product was successfully removed.
	 */
	async removeProductFromCart(user: User, product: string): Promise<boolean> {
		return this.dao.removeProductFromCart(user, product);
	}

	/**
	 * Removes all products from the current cart.
	 * @param user - The user who owns the cart.
	 * @returns A Promise that resolves to `true` if the cart was successfully cleared.
	 */
	async clearCart(user: User): Promise<boolean> {
		return this.dao.clearCart(user);
	}

	/**
	 * Deletes all carts of all users.
	 * @returns A Promise that resolves to `true` if all carts were successfully deleted.
	 */
	async deleteAllCarts(): Promise<boolean> {
		return this.dao.deleteAllCarts();
	}

	/**
	 * Retrieves all carts in the database.
	 * @returns A Promise that resolves to an array of carts.
	 */
	async getAllCarts(): Promise<Cart[]> {
		const carts = await this.dao.fetchAllCarts();
		for (let cart of carts) {
			cart.cart.products = await this.dao.fetchProducts(cart.id);
		}
		return carts.map((cart) => cart.cart);
	}

	/****/

	/**
	 * Check if a cart contains a product by model
	 * @returns A Boolean
	 */
	containsProduct(cart: Cart, model: string): boolean {
		return cart.products.some((product) => product.model === model);
	}
}

export default CartController;
