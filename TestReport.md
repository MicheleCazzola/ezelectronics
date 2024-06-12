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

    1. DAO + DB
    2. Controller + DAO + DB
    3. Route + Controller + DAO + DB

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

=====MICHELE
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| TC1: CartDAO - Get current cart | getCurrentCart (CartDAO) |  unit | WB (statement coverage) |
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
| TC21: CartController - Contains product utility function | containsProduct (CartController) | unit | WB (statement coverage) |
| TC22: CartRoutes - Get current cart | GET ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC23: CartRoutes - Add product to cart | POST ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC24: CartRoutes - Checkout cart | PATCH ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC25: CartRoutes - Get paid carts | GET ezelectronics/carts/history (CartRoutes) | unit | WB (statement coverage) |
| TC26: CartRoutes - Remove product from cart | DELETE ezelectronics/carts/products/:model (CartRoutes) | unit | WB (statement coverage) |
| TC27: CartRoutes - Empty current cart | DELETE ezelectronics/carts/current (CartRoutes) | unit | WB (statement coverage) |
| TC28: CartRoutes - Delete all carts | DELETE ezelectronics/carts (CartRoutes) | unit | WB (statement coverage) |
| TC29: CartRoutes - Get all carts | GET ezelectronics/carts/all (CartRoutes) | unit | WB (statement coverage) |
| TC30: CartDAO - Create cart | createCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC31: CartDAO - Add product to cart | addProductToCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC32: CartDAO - Get current cart | getCurrentCart (CartDAO) |  integration | BB (equivalent classes partitioning) |
| TC33: CartDAO - Get product | getProduct (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC34: CartDAO - Get current cart id | getCurrentCartId (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC35: CartDAO - Checkout cart | checkoutCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC36: CartDAO - Get paid carts | fetchPaidCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC37: CartDAO - Remove product from cart | removeProductFromCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC38: CartDAO - Clear cart | clearCart (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC39: CartDAO - Delete all carts | deleteAllCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC40: CartDAO - Get all carts | fetchAllCarts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC41: CartDAO - Fetch product in cart | fetchProducts (CartDAO) | integration | BB (equivalent classes partitioning) |
| TC42: CartController - Add product to cart | addToCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC43: CartController - Get cart | getCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC44: CartController - Checkout cart | checkoutCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC45: CartController - Clear current cart | clearCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC46: CartController - Remove product from cart | removeProductFromCart (CartController) | integration | BB (equivalent classes partitioning) |
| TC47: CartController - Get all customer carts | getCustomerCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC48: CartController - Get all carts | getAllCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC49: CartController - Delete all carts | deleteAllCarts (CartController) | integration | BB (equivalent classes partitioning) |
| TC50: CartRoutes - Add product to cart | POST ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC51: CartRoutes - Get current cart | GET ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC52: CartRoutes - Checkout cart | PATCH ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC53: CartRoutes - Get paid carts | GET ezelectronics/carts/history (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC54: CartRoutes - Remove product from cart | DELETE ezelectronics/carts/products/:model (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC54.1: CartRoutes - Remove product from cart failed - Model string empty | DELETE ezelectronics/carts/products/:model (CartRoutes) | API | WB (statement coverage) |
| TC55: CartRoutes - Empty current cart | DELETE ezelectronics/carts/current (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC56: CartRoutes - Delete all carts | DELETE ezelectronics/carts (CartRoutes) | API | BB (equivalent classes partitioning) |
| TC57: CartRoutes - Get all carts | GET ezelectronics/carts/all (CartRoutes) | API | BB (equivalent classes partitioning) |

=====FRANCESCO
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| | | | |

=====GIUSEPPE
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| | | | |

=====FLAVIANA
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| | | | |

=====END

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement | Test(s) |
| :--------------------: | :-----: |
|        **FR1**         |         |
|         FR1.1          |         |
|         FR1.2          |         |
|         FR1.3          |         |
|        **FR2**         |         |
|         FR2.1          |         |
|         FR2.2          |         |
|         FR2.3          |         |
|         FR2.4          |         |
|         FR2.5          |         |
|         FR2.6          |         |
|        **FR3**         |         |
|         FR3.1          |         |
|         FR3.2          |         |
|         FR3.3          |         |
|         FR3.4          |         |
|        FR3.4.1         |         |
|         FR3.5          |         |
|        FR3.5.1         |         |
|         FR3.7          |         |
|         FR3.8          |         |
|        **FR4**         |         |
|         FR4.1          |         |
|         FR4.2          |         |
|         FR4.3          |         |
|         FR4.4          |         |
|         FR4.5          |         |
|        **FR5**         |         |
|         FR5.1          |         |
|         FR5.2          |         |
|         FR5.3          |         |
|         FR5.4          |         |
|         FR5.5          |         |
|         FR5.6          |         |
|         FR5.7          |         |
|         FR5.8          |         |

| Scenario | Test(s) |
| :------: | :-----: |
|   1.1    |         |
|   1.2    |         |
|   1.3    |         |
|   1.4    |         |
|   2.1    |         |
|   2.2    |         |
|   3.1    |         |
|   3.2    |         |
|   3.3    |         |
|   4.1    |         |
|   4.2    |         |
|   4.3    |         |
|   4.4    |         |
|   4.5    |         |
|   5.1    |         |
|   5.2    |         |
|   6.1    |         |
|   6.2    |         |
|   6.3    |         |
|   6.4    |         |
|   6.5    |         |
|   7.1    |         |
|   7.2    |         |
|   7.3    |         |
|   8.1    |         |
|   8.2    |         |
|   8.3    |         |
|   8.4    |         |
|   8.5    |         |
|   8.6    |         |
|   8.7    |         |
|   8.8    |         |
|   8.9    |         |
|   9.1    |         |
|   9.2    |         |
|   10.1   |         |
|   10.2   |         |
|   10.3   |         |
|   10.4   |         |
|   10.5   |         |
|   10.6   |         |
|   10.7   |         |
|   10.8   |         |
|   10.9   |         |
|  10.10   |         |
|  10.11   |         |
|  10.12   |         |
|   11.1   |         |
|   11.2   |         |
|   12.1   |         |
|   13.1   |         |
|   14.1   |         |
|   15.1   |         |
|   16.1   |         |
|   17.1   |         |
|   17.2   |         |
|   18.1   |         |
|   19.1   |         |
|   19.2   |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
