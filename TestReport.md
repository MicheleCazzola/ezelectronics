# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![alt text](media/dependency_graph.png)

# Integration approach

Per ognuno dei quattro componenti presenti (User, Cart, Review, Product) è stato seguito il seguente approccio:

1. DAO unit test, Controller unit test, Route unit test
2. DAO + DB integration test
3. Controller + DAO + DB integration test
4. API test, invocando direttamente le routes del server

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

=====MICHELE
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| TC1: CartDAO - Get current cart | getCurrentCart (CartDAO) | unit | WB (statement coverage) |
| TC2: CartDAO - Get product | getProduct (CartDAO) | unit | WB (statement coverage) |
| TC3: CartDAO - Create cart | createCart (CartDAO) | unit | WB (statement coverage) |
| TC4: CartDAO - Checkout cart | checkoutCart (CartDAO) | unit | WB (statement coverage) |
| TC5: CartDAO - Add product to cart | addProductToCart (CartDAO) | unit | WB (statement coverage) |
| TC6: CartDAO - Fetch paid carts | fetchPaidCarts (CartDAO) | unit | WB (statement coverage) |
| TC7: CartDAO - Get current cart id | getCurrentCartId (CartDAO) | unit | WB (statement coverage) |
| TC8: CartDAO - Remove product from cart | removeProductFromCart (CartDAO) | unit | WB (statement coverage) |
| TC9: CartDAO - Clear cart | clearCart (CartDAO) | unit | WB (statement coverage) |
| TC10: CartDAO - Delete all carts | deleteAllCarts (CartDAO) | unit | WB (statement coverage) |
| TC11: CartDAO - Fetch all carts | fetchAllCarts (CartDAO) | unit | WB (statement coverage) |
| TC12: CartDAO - Fetch products | fetchProducts (CartDAO) | unit | WB (statement coverage) |
| TC13: CartController - Get cart | getCart (CartController) | unit | WB (statement coverage) |
| TC14: CartController - Get all customer carts | getCustomerCarts (CartController) | unit | WB (statement coverage) |
| TC15: CartController - Get all carts | getAllCarts (CartController) | unit | WB (statement coverage) |
| TC16: CartController - Add product to cart | addToCart (CartController) | unit | WB (statement coverage) |
| TC17: CartController - Checkout cart | checkoutCart (CartController) | unit | WB (statement coverage) |
| TC18: CartController - Clear cart | clearCart (CartController) | unit | WB (statement coverage) |
| TC19: CartController - Remove product from cart | removeProductFromCart (CartController) | unit | WB (statement coverage) |
| TC20: CartController - Delete all carts | deleteAllCarts (CartController) | unit | WB (statement coverage) |
| TC21: CartRoutes - Get current cart | GET ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC22: CartRoutes - Add product to cart | POST ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC23: CartRoutes - Checkout cart | PATCH ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC24: CartRoutes - Get paid carts | GET ezelectronics/carts/history (CartRoutes) | unit | WB (statement coverage) |
| TC25: CartRoutes - Remove product from cart | DELETE ezelectronics/carts/products/:model (CartRoutes) | unit | WB (statement coverage) |
| TC26: CartRoutes - Empty current cart | DELETE ezelectronics/carts/current (CartRoutes) | unit | WB (statement coverage) |
| TC27: CartRoutes - Delete all carts | DELETE ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC28: CartRoutes - Get all carts | GET ezelectronics/carts/all (CartRoutes) | unit | WB (statement coverage) |
| TC29: CartDAO - Create cart | createCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC30: CartDAO - Add product to cart | addProductToCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC31: CartDAO - Get current cart | getCurrentCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC32: CartDAO - Get product | getProduct (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC33: CartDAO - Get current cart id | getCurrentCartId (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC34: CartDAO - Checkout cart | checkoutCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC35: CartDAO - Get paid carts | fetchPaidCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC36: CartDAO - Remove product from cart | removeProductFromCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC37: CartDAO - Clear cart | clearCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC38: CartDAO - Delete all carts | deleteAllCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC39: CartDAO - Get all carts | fetchAllCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC40: CartDAO - Fetch products in cart | fetchProducts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC41: CartController - Add product to cart | addToCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC42: CartController - Get cart | getCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC43: CartController - Checkout cart | checkoutCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC44: CartController - Clear current cart | clearCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC45: CartController - Remove product from cart | removeProductFromCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC46: CartController - Get all customer carts | getCustomerCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC47: CartController - Get all carts | getAllCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC48: CartController - Delete all carts | deleteAllCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC49: CartRoutes - Add product to cart | POST ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC50: CartRoutes - Get current cart | GET ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC51: CartRoutes - Checkout cart | PATCH ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC52: CartRoutes - Get paid carts | GET ezelectronics/carts/history (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC53: CartRoutes - Remove product from cart | DELETE ezelectronics/carts/products/:model (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC53.1: CartRoutes - Remove product from cart failed - Model string empty | DELETE ezelectronics/carts/products/:model (CartRoutes) | API | WB (statement coverage) |
| TC54: CartRoutes - Empty current cart | DELETE ezelectronics/carts/current (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC55: CartRoutes - Delete all carts | DELETE ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC56: CartRoutes - Get all carts | GET ezelectronics/carts/all (CartRoutes) | API | BB (equivalent classes partitioning) |

=====FRANCESCO
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| TR1: ReviewDAO - Add a Review | ReviewDAO.addReview | unit | WB (statement coverage) |
| TR2: ReviewDAO - Get a Product's Reviews | ReviewDAO.getProductReviews | unit | WB (statement coverage) |
| TR3: ReviewDAO - Delete a Review | ReviewDAO.deleteReview | unit | WB (statement coverage) |
| TR4: ReviewDAO - Delete all Reviews of a Product | ReviewDAO.deleteReviewsOfProduct | unit | WB (statement coverage) |
| TR5: ReviewDAO - Delete all Reviews | ReviewDAO.deleteAllReviews | unit | WB (statement coverage) |
| TR6: ReviewController - Add a Review | ReviewController.addReview | unit | WB (statement coverage) |
| TR7: ReviewController - Get Product Reviews | ReviewController.getProductReviews | unit | WB (statement coverage) |
| TR8: ReviewController - Delete Product Review | ReviewController.deleteReview | unit | WB (statement coverage) |
| TR9: ReviewController - Delete All Reviews of a Product | ReviewController.deleteReviewsOfProduct | unit | WB (statement coverage) |
| TR10: ReviewController - Delete All Reviews | ReviewController.deleteAllReviews | unit | WB (statement coverage) |
| TR11: ReviewRoute - Add a Review | POST ezelectronics/reviews/:model | unit | WB (statement coverage) |
| TR12: ReviewRoute - Get a Product's Reviews | GET ezelectronics/reviews/:model | unit | WB (statement coverage) |
| TR13: ReviewRoute - Delete a Review | DELETE ezelectronics/reviews/:model | unit | WB (statement coverage) |
| TR14: ReviewRoute - Delete All Reviews of a Product | DELETE ezelectronics/reviews/:model/all | unit | WB (statement coverage) |
| TR15: ReviewRoute - Delete All Reviews | DELETE ezelectronics/reviews/ | unit | WB (statement coverage) |
| TR16: ReviewDAO - Add a Review | ReviewDAO.addReview | integration | BB (eq partitioning) |
| TR17: ReviewDAO - Get a Product's Reviews | ReviewDAO.getProductReviews | integration | BB (eq partitioning) |
| TR18: ReviewDAO - Delete a Review | ReviewDAO.deleteReview | integration | BB (eq partitioning) |
| TR19: ReviewDAO - Delete all Reviews of a Product | ReviewDAO.deleteReviewsOfProduct | integration | BB (eq partitioning) |
| TR20: ReviewDAO - Delete all Reviews | ReviewDAO.deleteAllReviews | integration | BB (eq partitioning) |
| TR21: ReviewController - Add a Review | ReviewController.addReview | integration | BB (eq partitioning) |
| TR22: ReviewController - Get Product Reviews | ReviewController.getProductReviews | integration | BB (eq partitioning) |
| TR23: ReviewController - Delete Product Review | ReviewController.deleteReview | integration | BB (eq partitioning) |
| TR24: ReviewController - Delete All Reviews of a Product | ReviewController.deleteReviewsOfProduct | integration | BB (eq partitioning) |
| TR25: ReviewController - Delete All Reviews | ReviewController.deleteAllReviews | integration | BB (eq partitioning) |
| TR26: ReviewRoute - Add a Review | POST ezelectronics/reviews/:model | integration | BB (eq partitioning) |
| TR27: ReviewRoute - Get a Product's Reviews | GET ezelectronics/reviews/:model | integration | BB (eq partitioning) |
| TR28: ReviewRoute - Delete a Review | DELETE ezelectronics/reviews/:model | integration | BB (eq partitioning) |
| TR29: ReviewRoute - Delete All Reviews of a Product | DELETE ezelectronics/reviews/:model/all | integration | BB (eq partitioning) |
| TR30: ReviewRoute - Delete All Reviews | DELETE ezelectronics/reviews/ | integration | BB (eq partitioning) |

=====GIUSEPPE
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| TP1: ProductDAO - createProduct test | createProduct (ProductDAO) | unit | WB (statement coverage) |
| TP2: ProductDAO - existsProduct test | existProduct (ProductDAO) | unit | WB (statement coverage) |
| TP3: ProductDAO - getProductByModel test | getProductByModel (ProductDAO) | unit | WB (statement coverage) |
| TP4: ProductDAO - increaseQuantity tests | increaseQuantity (ProductDAO) | unit | WB (statement coverage) |
| TP5: ProductDAO - decreaseQuantity test | decreaseQuantity (ProductDAO) | unit | WB (statement coverage) |
| TP6: ProductDAO - getAllProducts test| getAllProducts (ProductDAO) | unit | WB (statement coverage) |
| TP7: ProductDAO - getAllAvailableProducts test | getAllAvailableProducts (ProductDAO) | unit | WB (statement coverage) |
| TP8: ProductDAO - deleteProducts test| deleteProducts (ProductDAO) | unit | WB (statement coverage) |
| TP9: ProductDAO - deleteProductByModel test| deleteProductByModel (ProductDAO) | unit | WB (statement coverage) |
| TP10: ProductDAO - getProductQuantity test| getProductQuantity (ProductDAO) | unit | WB (statement coverage) |
| TP11: ProductController - registerProducts tests| registerProducts (ProductController) | unit | WB (statement coverage) |
| TP12: ProductController - productExist test | productExist (ProductController) | unit | WB (statement coverage) |
| TP13: ProductController - productByModel test | productByModel (ProductController) | unit | WB (statement coverage) |
| TP14: ProductController - changeProductquantity test| changeProductQuantity (ProductController) | unit | WB (statement coverage) |
| TP15: ProductController - sellProducts test| sellProduct (ProductController) | unit | WB (statement coverage) |
| TP16: ProductController - getProducts tests| getProducts (ProductController) | unit | WB (statement coverage) |
| TP17: ProductController - getAvailableProducts test | getAllAvailableProducts (ProductController) | unit | WB (statement coverage) |
| TP18: ProductController - deleteAllProducts test | deleteAllProducts (ProductController) | unit | WB (statement coverage) |
| TP19: ProductController - deleteProduct test | deleteProduct (ProductController) | unit | WB (statement coverage) |
| TP20: ProductRoute - POST - Testing of the Route for registering the arrival of a set of product | POST ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP21: ProductRoute - Testing body content | POST ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP22: ProductRoute - PATCH - Testing of the Route for registering the increase in quantity of a product | PATCH ezelectronics/products/:model (ProductRoute) | unit | WB (statement coverage) |
| TP23: ProductRoute - Date validation testing | PATCH ezelectronics/products/:model (ProductRoute) | unit | WB (statement coverage) |
| TP24: ProductRoute - PATCH - Testing of the Route for selling a product| PATCH ezelectronics/products/:model/sell (ProductRoute) | unit | WB (statement coverage) |
| TP25: ProductRoute - Date validation testing | PATCH ezelectronics/products/:model/sell (ProductRoute) | unit | WB (statement coverage) |
| TP26: ProductRoute - GET - Testing of Route for retrieving all products | GET ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP27: ProductRoute - It should return a 422 error if `grouping` is null and any of `category` or `model` is not null | GET ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP28: ProductRoute - It should return a 422 error if `grouping` is `category` and `category` is null OR `model` is not null | GET ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP29: ProductRoute - It should return a 422 error if `grouping` is `model` and `model` is null OR `category` is not null | GET ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP30: ProductRoute - GET - Testing of the Route for retrieving all available products | GET ezelectronics/products/available (ProductRoute) | unit | WB (statement coverage) |
| TP31: ProductRoute - It should return a 422 error if `grouping` is null and any of `category` or `model` is not null | GET ezelectronics/products/available (ProductRoute) | unit | WB (statement coverage) |
| TP32: ProductRoute - It should return a 422 error if `grouping` is `category` and `category` is null OR `model` is not null | GET ezelectronics/products/available (ProductRoute) | unit | WB (statement coverage) |
| TP33: ProductRoute - It should return a 422 error if `grouping` is `model` and `model` is null OR `category` is not null | GET ezelectronics/products/available (ProductRoute) | unit | WB (statement coverage) |
| TP34: ProductRoute - DELETE - Testing of the Route for deleting all products | DELETE ezelectronics/products (ProductRoute) | unit | WB (statement coverage) |
| TP35: ProductRoute - DELETE - Testing of the Route for deleting a product | DELETE ezelectronics/products/:model (ProductRoute) | unit | WB (statement coverage) |
| TP36: ProductDao - createProduct test | createProduct (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP37: ProductDao - existProducts tests | existsProduct (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP38: ProductDao - getProductByModel tests | getProductByModel (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP39: ProductDao - increaseQuantity Test | increaseQuantity (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP40: ProductDao - decreaseQuantity test | decreaseQuantity (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP41: ProductDao - getAllProducts test | getAllProducts (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP42: ProductDao - getAllAvailableProducts test | getAllAvailableProducts (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP43: ProductDao - deleteProducts test | deleteProducts (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP44: ProductDao - deleteProductByModel tests | deleteProductByModel (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP45: ProductDao - getProductQuantity test | getProductQuantity (ProductDao) | integration | BB (equivalent classes partitioning) |
| TP46: ProductController - registerProduct test | registerProducts (ProductController) | integration | BB (equivalent classes partitioning) |
| TP47: ProductController - productExist test | productExist (ProductController) | integration | BB (equivalent classes partitioning) |
| TP48: ProductController - productByModel test | productByModel (ProductController) | integration | BB (equivalent classes partitioning) |
| TP49: ProductController - changeProductQuantity test | changeProductQuantity (ProductController) | integration | BB (equivalent classes partitioning) |
| TP50: ProductController - sellProduct test | sellProduct (ProductController) | integration | BB (equivalent classes partitioning) |
| TP51: ProductController - getProducts test | getProducts (ProductController) | integration | BB (equivalent classes partitioning) |
| TP52: ProductController - getAvailableProducts test| getAvailableProducts (ProductController) | integration | BB (equivalent classes partitioning) |
| TP53: ProductController - deleteAllProducts test | deleteAllProducts (ProductController) | integration | BB (equivalent classes partitioning) |
| TP54: ProductController - deleteProduct test | deleteProduct (ProductController) | integration | BB (equivalent classes partitioning) |
| TP55: ProductRoute - POST - Route for registering the arrival of a set of products | POST ezelectronics/products (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP56: ProductRoute - PATCH - Route for registering the increase in quantity of a product | PATCH ezelectronics/products/:model (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP57: ProductRoute - PATCH - Route for selling a product | PATCH ezelectronics/products/:model/sell (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP58: ProductRoute - GET - Route for retrieving all products | GET ezelectronics/products (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP59: ProductRoute - GET - Route for retrieving all Available products | GET ezelectronics/products/available (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP60: ProductRoute - DELETE - Deletes one product from the database | DELETE ezelectronics/products/:model (ProductRoute) | API | BB (equivalent classes partitioning) |
| TP61: ProductRoute - DELETE - Deletes all products from the database | DELETE ezelectronics/products (ProductRoute) | API | BB (equivalent classes partitioning) |

=====FLAVIANA
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| TU1: UserDAO - Check login information | getIsUserAuthenticated (UserDAO) | unit | WB (statement coverage) |
| TU2: UserDAO - Create a new user | createUser (UserDAO) | unit | WB (statement coverage) |
| TU3: UserDAO - Get a specific user | getUserByUsername (UserDAO) | unit | WB (statement coverage) |
| TU4: UserDAO - Get users | getUser (UserDAO) | unit | WB (statement coverage) |
| TU5: UserDAO - Get all users with a specific role | getUserByRole (UserDAO) | unit | WB (statement coverage) |
| TU6: UserDAO - Delete a specific user | deleteUser (UserDAO) | unit | WB (statement coverage) |
| TU7: UserDAO - Delete all users | deleteAll (UserDAO) | unit | WB (statement coverage) |
| TU8: UserDAO - Check if the role of the user is Admin | isAdminByUsername (UserDAO) | unit | WB (statement coverage) |
| TU9: UserDAO - Update user information | updateUserInformation (UserDAO) | unit | WB (statement coverage) |
| TU10: UserController - Create a new user | createUser (UserController) | unit | WB (statement coverage) |
| TU11: UserController - Get all users | getUsers (UserController) | unit | WB (statement coverage) |
| TU12: UserController - Get all users with a specific role | getUsersByRole (UserController) | unit | WB (statement coverage) |
| TU13: UserController - Get a specific user | getUsersByUsername (UserController) | unit | WB (statement coverage) |
| TU14: UserController - Delete a specific user | deleteUser (UserController) | unit | WB (statement coverage) |
| TU15: UserController - Delete all users | deleteAll (UserController) | unit | WB (statement coverage) |
| TU16: UserController - Update user information | updateUserInfo (UserController) | unit | WB (statement coverage) |
| TU17: UserRoutes - Create a new user | POST ezelectronics/users (UserRoutes) | unit | WB (statement coverage) |
| TU18: UserRoutes - Get all users | GET ezelectronics/users (UserRoutes) | unit | WB (statement coverage) |
| TU19: UserRoutes - Get all users with a specific role | GET ezelectronics/users/roles/:role (UserRoutes) | unit | WB (statement coverage) |
| TU20: UserRoutes - Get a user by its username | GET ezelectronics/users/:username (UserRoutes) | unit | WB (statement coverage) |
| TU21: UserRoutes - Delete a user | DELETE ezelectronics/users/:username (UserRoutes) | unit | WB (statement coverage) |
| TU22: UserRoutes - Delete all users | DELETE ezelectronics/users (UserRoutes) | unit | WB (statement coverage) |
| TU23: UserRoutes - Update user information | PATCH ezelectronics/users/:username (UserRoutes) | unit | WB (statement coverage) |
| TU24: UserRoutes - Log in a user | POST ezelectronics/sessions (UserRoutes) | unit | WB (statement coverage) |
| TU25: UserRoutes - Log out the currently logged in user | DELETE ezelectronics/sessions/current (UserRoutes) | unit | WB (statement coverage) |
| TU26: UserRoutes - Get the currently logged in user | GET ezelectronics/sessions/current (UserRoutes) | unit | WB (statement coverage) |
| TU27: UserDAO - Check login information | getIsUserAuthenticated (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU28: UserDAO - Create a new user | createUser (UserDAO) | unit | BB (equivalent classes partitioning) |
| TU29: UserDAO - Get a specific user | getUserByUsername (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU30: UserDAO - Get users | getUser (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU31: UserDAO - Get all users with a specific role | getUserByRole (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU32: UserDAO - Delete a specific user | deleteUser (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU33: UserDAO - Delete all users | deleteAll (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU34: UserDAO - Check if the role of the user is Admin | isAdminByUsername (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU35: UserDAO - Update user information | updateUserInformation (UserDAO) | integration | BB (equivalent classes partitioning) |
| TU36: UserController - Create a new user | createUser (UserController) | integration | BB (equivalent classes partitioning) |
| TU37: UserController - Get all users | getUsers (UserController) | integration | BB (equivalent classes partitioning) |
| TU38: UserController - Get all users with a specific role | getUsersByRole (UserController) | integration | BB (equivalent classes partitioning) |
| TU39: UserController - Get a specific user | getUsersByUsername (UserController) | integration | BB (equivalent classes partitioning) |
| TU40: UserController - Delete a specific user | deleteUser (UserController) | integration | BB (equivalent classes partitioning) |
| TU41: UserController - Delete all users | deleteAll (UserController) | integration | BB (equivalent classes partitioning) |
| TU42: UserController - Update user information | updateUserInfo (UserController) | integration | BB (equivalent classes partitioning) |
| TU43: UserRoutes - Create a new user | POST ezelectronics/users (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU44: UserRoutes - Get all users | GET ezelectronics/users (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU45: UserRoutes - Get all users with a specific role | GET ezelectronics/users/roles/:role (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU46: UserRoutes - Get a user by its username | GET ezelectronics/users/:username (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU47: UserRoutes - Delete a user | DELETE ezelectronics/users/:username (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU48: UserRoutes - Delete all users | DELETE ezelectronics/users (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU49: UserRoutes - Update user information | PATCH ezelectronics/users/:username (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU50: UserRoutes - Log in a user | POST ezelectronics/sessions (UserRoutes) | API | BB (equivalent classes partitioning)|
| TU51: UserRoutes - Log out the currently logged in user | DELETE ezelectronics/sessions/current (UserRoutes) | API | BB (equivalent classes partitioning) |
| TU52: UserRoutes - Get the currently logged in user | GET ezelectronics/sessions/current (UserRoutes) | API | BB (equivalent classes partitioning) |

=====END

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement |                               Test(s)                                |
| :--------------------: | :------------------------------------------------------------------: |
|        **FR1**         |        TU1, TU2, TU10, TU17, TU24-TU28, TU36, TU43, TU50-TU52        |
|         FR1.1          |                  TU1, TU24, TU26, TU27, TU50, TU52                   |
|         FR1.2          |                              TU25, TU51                              |
|         FR1.3          |                  TU2, TU10, TU17, TU28, TU36, TU43                   |
|        **FR2**         |    TU3-TU9, TU11-TU16, TU18-TU23, TU29-TU35, TU37-TU42, TU44-TU49    |
|         FR2.1          |                  TU4, TU11, TU18, TU30, TU37, TU44                   |
|         FR2.2          |                  TU5, TU12, TU19, TU31, TU38, TU45                   |
|         FR2.3          |                  TU3, TU13, TU20, TU29, TU39, TU46                   |
|         FR2.4          |                  TU9, TU16, TU23, TU35, TU42, TU49                   |
|         FR2.5          |             TU6, TU8, TU14, TU21, TU32, TU34 TU40, TU47              |
|         FR2.6          |                  TU7, TU15, TU22, TU33, TU41, TU48                   |
|        **FR3**         |                               TP1-TP61                               |
|         FR3.1          |       TP1, TP2, TP11, TP12, TP20, TP36, TP37, TP46, TP47, TP55       |
|         FR3.2          |          TP4, TP10, TP14, TP22, TP23 TP39, TP45 TP49, TP56           |
|         FR3.3          |          TP5, TP10, TP15, TP24, TP25,TP40, TP45, TP50, TP57          |
|         FR3.4          |         TP6, TP16, TP26, TP27, TP28, TP29, TP41, TP51, TP58          |
|        FR3.4.1         |         TP7, TP17, TP30, TP31, TP32, TP33, TP42, TP52, TP59          |
|         FR3.5          |            TP6, TP16, TP26, TP27, TP28, TP41, TP51, TP58             |
|        FR3.5.1         |            TP7, TP17, TP31, TP32, TP33, TP42, TP52, TP59             |
|         FR3.6          | TP3, TP6, TP13, TP16, TP26, TP27, TP29, TP38, TP41, TP48, TP51, TP58 |
|        FR3.6.1         | TP3, TP7, TP13, TP17, TP30, TP31, TP33, TP38, TP42, TP48, TP52, TP59 |
|         FR3.7          |                     T9, T19, T35, T44, T54, T60                      |
|         FR3.8          |                     T8, T18, T34, T43, T53, T61                      |
|        **FR4**         |                                                                      |
|         FR4.1          |                   TR1, TR6, TR11, TR16, TR21, TR26                   |
|         FR4.2          |                   TR2, TR7, TR12, TR17, TR22, TR27                   |
|         FR4.3          |                   TR3, TR8, TR13, TR18, TR23, TR28                   |
|         FR4.4          |                   TR4, TR9, TR14, TR19, TR24, TR29                   |
|         FR4.5          |                  TR5, TR10, TR15, TR20, TR25, TR30                   |
|        **FR5**         |                              TC1 - TC56                              |
|         FR5.1          |                     TC1,TC13,TC21,TC31,TC42,TC50                     |
|         FR5.2          |       TC2,TC3,TC5,TC7,TC16,TC22,TC29,TC30,TC32,TC33,TC41,TC49        |
|         FR5.3          |                TC1,TC4,TC17,TC23,TC31,TC34,TC43,TC51                 |
|         FR5.4          |                TC6,TC12,TC14,TC24,TC35,TC40,TC46,TC52                |
|         FR5.5          |        TC1,TC7,TC8,TC19,TC25,TC31,TC33,TC36,TC45,TC53,TC53.1         |
|         FR5.6          |                TC7,TC9,TC18,TC26,TC33,TC37,TC44,TC54                 |
|         FR5.7          |               TC11,TC12,TC15,TC27,TC35,TC40,TC47,TC56                |
|         FR5.8          |                    TC10,TC20,TC28,TC38,TC48,TC55                     |

| Scenario |                         Test(s)                         |
| :------: | :-----------------------------------------------------: |
|   1.1    |                        TU1, TU27                        |
|   1.2    |                       TU1, TU27,                        |
|   1.3    |                       TU24, TU50                        |
|   1.4    |                       TU24, TU50                        |
|   2.1    |                       TU25, TU51                        |
|   2.2    |                       TU25, TU51                        |
|   3.1    |            TU2, TU10, TU17, TU28, TU36, TU43            |
|   3.2    |            TU2, TU10, TU17, TU28, TU36, TU43            |
|   3.3    |            TU2, TU10, TU17, TU28, TU36, TU43            |
|   4.1    |            TU3, TU13, TU20, TU29, TU39, TU46            |
|   4.2    |            TU3, TU13, TU20, TU29, TU39, TU46            |
|   4.3    |            TU4, TU11, TU18, TU30, TU37, TU44            |
|   4.4    |            TU5, TU12, TU19, TU31, TU38, TU45            |
|   4.5    |            TU5, TU12, TU19, TU31, TU38, TU45            |
|   5.1    |       TU6, TU8, TU14, TU21, TU32, TU34 TU40, TU47       |
|   5.2    |       TU6, TU8, TU14, TU21, TU32, TU34 TU40, TU47       |
|   6.1    |            TP1, TP11, TP20, TP36, TP46, TP55            |
|   6.2    |            TP1, TP11, TP20, TP36, TP46, TP55            |
|   6.3    |            TP1, TP11, TP20, TP36, TP46, TP55            |
|   6.4    |    TP4, TP10, TP14, TP22, TP23 TP39, TP45 TP49, TP56    |
|   6.5    |    TP4, TP10, TP14, TP22, TP23 TP39, TP45 TP49, TP56    |
|   7.1    |   TP5, TP10, TP15, TP24, TP25,TP40, TP45, TP50, TP57    |
|   7.2    |   TP5, TP10, TP15, TP24, TP25,TP40, TP45, TP50, TP57    |
|   7.3    |   TP5, TP10, TP15, TP24, TP25,TP40, TP45, TP50, TP57    |
|   8.1    |               TP3, TP13, TP38, TP48, TP59               |
|   8.2    |               TP3, TP13, TP38, TP48, TP59               |
|   8.3    |         TP6, TP16, TP26, TP27, TP41, TP51, TP58         |
|   8.4    |         TP6, TP16, TP26, TP28, TP41, TP51, TP58         |
|   8.5    |         TP6, TP16, TP26, TP28, TP41, TP51, TP58         |
|   8.6    |         TP6, TP16, TP26, TP29, TP41, TP51, TP58         |
|   8.7    |         TP7, TP17, TP30, TP31, TP42, TP52, TP59         |
|   8.8    |         TP7, TP17, TP30, TP32, TP42, TP52, TP59         |
|   8.9    |         TP7, TP17, TP30, TP33, TP42, TP52, TP59         |
|   9.1    |               T9, T19, T35 ,T44, T54, T60               |
|   9.2    |               T8, T18, T34, T43, T53, T61               |
|   10.1   |              TC1,TC13,TC21,TC31,TC42,TC50               |
|   10.2   |         TC6,TC12,TC14,TC24,TC35,TC40,TC46,TC52          |
|   10.3   | TC2,TC3,TC5,TC7,TC16,TC22,TC29,TC30,TC32,TC33,TC41,TC49 |
|   10.4   |              TC2,TC16,TC22,TC32,TC41,TC49               |
|   10.5   |              TC2,TC16,TC22,TC32,TC41,TC49               |
|   10.6   |          TC1,TC4,TC17,TC23,TC31,TC34,TC43,TC51          |
|   10.7   |              TC1,TC17,TC23,TC31,TC43,TC51               |
|   10.8   |              TC1,TC17,TC23,TC31,TC43,TC51               |
|   10.9   |    TC8,TC19,TC25,TC33,TC36,TC45,TC53,TC53.1,TP2,TP35    |
|  10.10   |      TC8,TC19,TC25,TC36,TC45,TC53,TC53.1,TP2,TP35       |
|  10.11   |  TC7,TC8,TC19,TC25,TC33,TC36,TC45,TC53,TC53.1,TP2,TP35  |
|  10.12   |  TC7,TC8,TC19,TC25,TC33,TC36,TC45,TC53,TC53.1,TP2,TP35  |
|   11.1   |                                                         |
|   11.2   |                                                         |
|   12.1   |                                                         |
|   13.1   |                                                         |
|   14.1   |                                                         |
|   15.1   |         TC11,TC12,TC15,TC28,TC39,TC40,TC47,TC56         |
|   16.1   |              TC10,TC20,TC27,TC38,TC48,TC55              |
|   17.1   |            TR1, TR6, TR11, TR16, TR21, TR26             |
|   17.2   |            TR3, TR8, TR13, TR18, TR23, TR28             |
|   18.1   |            TR2, TR7, TR12, TR17, TR22, TR27             |
|   19.1   |            TR4, TR9, TR14, TR19, TR24, TR29             |
|   19.2   |            TR5, TR10, TR15, TR20, TR25, TR30            |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
