import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { assignments, categories, assignmentCategories } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

// ─── Sandbox schemas ──────────────────────────────────────────────────────────

async function createEcommerceSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_ecommerce;
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.customers (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      city TEXT NOT NULL, joined_at DATE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.products (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL, stock INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES assignment_ecommerce.customers(id),
      product_id INTEGER REFERENCES assignment_ecommerce.products(id),
      quantity INTEGER NOT NULL, total_amount NUMERIC(10,2) NOT NULL,
      ordered_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    TRUNCATE assignment_ecommerce.orders, assignment_ecommerce.products, assignment_ecommerce.customers RESTART IDENTITY CASCADE;
    INSERT INTO assignment_ecommerce.customers (name, email, city, joined_at) VALUES
      ('Alice Johnson','alice@example.com','New York','2023-01-15'),
      ('Bob Smith','bob@example.com','Los Angeles','2023-02-20'),
      ('Carol White','carol@example.com','Chicago','2023-03-10'),
      ('David Brown','david@example.com','New York','2023-04-05'),
      ('Emma Davis','emma@example.com','Houston','2023-05-18'),
      ('Frank Miller','frank@example.com','Phoenix','2023-06-22'),
      ('Grace Wilson','grace@example.com','Philadelphia','2023-07-11'),
      ('Henry Moore','henry@example.com','San Antonio','2023-08-30'),
      ('Isla Taylor','isla@example.com','San Diego','2023-09-14'),
      ('Jack Anderson','jack@example.com','Dallas','2023-10-05');
    INSERT INTO assignment_ecommerce.products (name, category, price, stock) VALUES
      ('Laptop Pro 15','Electronics',1299.99,50),('Wireless Mouse','Electronics',29.99,200),
      ('USB-C Hub','Electronics',49.99,150),('Desk Chair','Furniture',299.99,30),
      ('Standing Desk','Furniture',599.99,20),('Python Book','Books',39.99,100),
      ('SQL Mastery','Books',34.99,80),('Mechanical Keyboard','Electronics',149.99,75),
      ('Monitor 27"','Electronics',399.99,40),('Bookshelf','Furniture',189.99,25),
      ('JavaScript Guide','Books',44.99,90),('Webcam HD','Electronics',79.99,60),
      ('Office Lamp','Furniture',59.99,45),('Data Science Book','Books',49.99,70),
      ('Tablet 10"','Electronics',499.99,35);
    INSERT INTO assignment_ecommerce.orders (customer_id, product_id, quantity, total_amount, ordered_at) VALUES
      (1,1,1,1299.99,'2024-01-10 10:00:00'),(1,2,2,59.98,'2024-01-12 11:00:00'),
      (2,3,1,49.99,'2024-01-15 09:30:00'),(3,4,1,299.99,'2024-01-20 14:00:00'),
      (3,6,1,39.99,'2024-01-22 16:00:00'),(4,1,1,1299.99,'2024-02-01 10:00:00'),
      (4,5,1,599.99,'2024-02-05 12:00:00'),(5,7,2,69.98,'2024-02-10 15:00:00'),
      (2,2,3,89.97,'2024-02-15 13:00:00'),(1,7,1,34.99,'2024-02-20 11:00:00'),
      (6,8,1,149.99,'2024-02-25 10:00:00'),(7,9,1,399.99,'2024-03-01 09:00:00'),
      (8,10,1,189.99,'2024-03-05 14:00:00'),(9,11,2,89.98,'2024-03-10 11:00:00'),
      (10,12,1,79.99,'2024-03-15 16:00:00'),(1,13,1,59.99,'2024-03-20 13:00:00'),
      (2,14,1,49.99,'2024-03-25 10:00:00'),(3,15,1,499.99,'2024-03-28 15:00:00'),
      (4,8,2,299.98,'2024-04-01 09:30:00'),(5,9,1,399.99,'2024-04-05 14:00:00'),
      (6,3,2,99.98,'2024-04-10 11:00:00'),(7,6,1,39.99,'2024-04-15 16:30:00'),
      (8,1,1,1299.99,'2024-04-20 10:00:00'),(9,2,4,119.96,'2024-04-25 13:00:00'),
      (10,5,1,599.99,'2024-04-30 09:00:00');
  `);
  console.log("✅ Ecommerce sandbox created");
}

async function createHrSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_hr;
    CREATE TABLE IF NOT EXISTS assignment_hr.departments (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, budget NUMERIC(12,2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_hr.employees (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL,
      department_id INTEGER REFERENCES assignment_hr.departments(id),
      salary NUMERIC(10,2) NOT NULL, hire_date DATE NOT NULL,
      manager_id INTEGER REFERENCES assignment_hr.employees(id)
    );
    TRUNCATE assignment_hr.employees, assignment_hr.departments RESTART IDENTITY CASCADE;
    INSERT INTO assignment_hr.departments (name, budget) VALUES
      ('Engineering',2000000),('Marketing',800000),('Sales',1200000),
      ('HR',500000),('Finance',700000),('Operations',900000),('Legal',600000);
    INSERT INTO assignment_hr.employees (name, department_id, salary, hire_date, manager_id) VALUES
      ('Sarah Connor',1,120000,'2019-03-01',NULL),('John Reese',1,95000,'2020-06-15',1),
      ('Mary Jane',1,88000,'2021-01-10',1),('Peter Parker',2,72000,'2020-09-01',NULL),
      ('Tony Stark',2,85000,'2019-11-20',4),('Steve Rogers',3,90000,'2018-07-04',NULL),
      ('Natasha Romanova',3,82000,'2021-03-15',6),('Bruce Banner',4,68000,'2022-01-05',NULL),
      ('Clint Barton',5,95000,'2019-05-20',NULL),('Wanda Maximoff',1,105000,'2020-08-01',1),
      ('Vision Android',1,78000,'2022-06-01',1),('Nick Fury',6,110000,'2017-09-15',NULL),
      ('Maria Hill',6,88000,'2019-02-01',12),('Phil Coulson',7,92000,'2018-04-10',NULL),
      ('Sam Wilson',3,76000,'2021-07-20',6),('Bucky Barnes',2,69000,'2022-03-01',4),
      ('Thor Odinson',1,115000,'2019-01-15',1),('Loki Laufeyson',7,87000,'2020-11-01',14),
      ('Scott Lang',6,72000,'2021-09-10',12),('Hope Van Dyne',5,98000,'2019-08-15',NULL);
  `);
  console.log("✅ HR sandbox created");
}

async function createSchoolSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_school;
    CREATE TABLE IF NOT EXISTS assignment_school.students (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, grade_level INTEGER NOT NULL,
      enrollment_date DATE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_school.courses (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, credits INTEGER NOT NULL,
      instructor TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_school.enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES assignment_school.students(id),
      course_id INTEGER REFERENCES assignment_school.courses(id),
      grade NUMERIC(4,2), semester TEXT NOT NULL
    );
    TRUNCATE assignment_school.enrollments, assignment_school.courses, assignment_school.students RESTART IDENTITY CASCADE;
    INSERT INTO assignment_school.students (name, grade_level, enrollment_date) VALUES
      ('Hermione Granger',3,'2022-09-01'),('Harry Potter',3,'2022-09-01'),
      ('Ron Weasley',3,'2022-09-01'),('Luna Lovegood',2,'2023-01-15'),
      ('Draco Malfoy',3,'2022-09-01'),('Neville Longbottom',3,'2022-09-01'),
      ('Ginny Weasley',2,'2023-01-15'),('Dean Thomas',3,'2022-09-01'),
      ('Seamus Finnigan',3,'2022-09-01'),('Lavender Brown',2,'2023-01-15'),
      ('Cho Chang',4,'2021-09-01'),('Cedric Diggory',4,'2021-09-01');
    INSERT INTO assignment_school.courses (name, credits, instructor) VALUES
      ('Database Systems',4,'Prof. Dumbledore'),('Algorithms',3,'Prof. McGonagall'),
      ('Web Development',3,'Prof. Snape'),('Machine Learning',4,'Prof. Dumbledore'),
      ('Data Structures',3,'Prof. McGonagall'),('Computer Networks',3,'Prof. Flitwick'),
      ('Operating Systems',4,'Prof. Sprout'),('Software Engineering',3,'Prof. Lupin'),
      ('Cybersecurity',3,'Prof. Moody'),('Cloud Computing',4,'Prof. Flitwick');
    INSERT INTO assignment_school.enrollments (student_id, course_id, grade, semester) VALUES
      (1,1,4.0,'Fall 2023'),(1,2,3.7,'Fall 2023'),(1,4,3.9,'Spring 2024'),
      (2,1,3.2,'Fall 2023'),(2,3,3.5,'Fall 2023'),(3,1,2.8,'Fall 2023'),
      (3,5,3.0,'Spring 2024'),(4,2,3.8,'Fall 2023'),(4,3,3.6,'Fall 2023'),
      (5,1,3.1,'Fall 2023'),(6,4,3.4,'Spring 2024'),(6,5,3.2,'Spring 2024'),
      (7,6,3.9,'Fall 2023'),(7,7,3.7,'Spring 2024'),(8,8,3.3,'Fall 2023'),
      (9,9,2.9,'Spring 2024'),(10,10,3.5,'Fall 2023'),(11,1,3.8,'Fall 2023'),
      (11,4,4.0,'Spring 2024'),(12,2,3.6,'Fall 2023'),(12,6,3.4,'Spring 2024'),
      (1,6,3.8,'Spring 2024'),(2,7,3.1,'Spring 2024'),(3,8,2.7,'Fall 2023'),
      (4,9,3.5,'Fall 2023'),(5,10,2.9,'Spring 2024'),(6,1,3.3,'Fall 2023');
  `);
  console.log("✅ School sandbox created");
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function seedCategories() {
  await pool.query(`
    TRUNCATE TABLE
      assignment_categories,
      solved_assignments,
      attempts,
      assignments,
      categories
    RESTART IDENTITY CASCADE
  `);

  const rows = await db.insert(categories).values([
    {
      slug: "top-50-interview",
      name: "Top 50 SQL Interview",
      description: "The 50 most commonly asked SQL questions in technical interviews at top companies.",
      icon: "Trophy",
      color: "amber",
      displayOrder: 1,
    },
    {
      slug: "neetcode-150",
      name: "NeetCode 150",
      description: "Curated SQL problems from the NeetCode 150 list — structured for systematic preparation.",
      icon: "Zap",
      color: "indigo",
      displayOrder: 2,
    },
    {
      slug: "aggregations",
      name: "Aggregations & Grouping",
      description: "Master GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX and aggregate patterns.",
      icon: "BarChart2",
      color: "emerald",
      displayOrder: 3,
    },
    {
      slug: "joins",
      name: "JOINs",
      description: "Practice INNER JOIN, LEFT JOIN, self-joins, and multi-table query patterns.",
      icon: "GitMerge",
      color: "sky",
      displayOrder: 4,
    },
    {
      slug: "window-functions",
      name: "Window Functions",
      description: "ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, and advanced analytical queries.",
      icon: "Layers",
      color: "purple",
      displayOrder: 5,
    },
    {
      slug: "subqueries",
      name: "Subqueries & CTEs",
      description: "Correlated subqueries, EXISTS, IN, and WITH clauses for complex data retrieval.",
      icon: "Code2",
      color: "rose",
      displayOrder: 6,
    },
  ]).returning();

  console.log("✅ Categories seeded:", rows.map((r) => r.slug).join(", "));
  return rows;
}

// ─── All Assignment Definitions ───────────────────────────────────────────────

function getAllAssignments() {
  return [

    // ═══════════════════════════════════════════════════════════════════════════
    // ECOMMERCE QUESTIONS (1–60)
    // ═══════════════════════════════════════════════════════════════════════════

    {
      title: "Top Customers by Spending",
      description: "Query customer orders to find who has spent the most. Practice JOINs and aggregation.",
      difficulty: "easy" as const,
      question: `Find the top 3 customers by total spending.\nReturn their name, email, city, and total_spent (sum of all their order amounts).\nOrder the results by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, city, total_spent",
      solutionQuery: `SELECT c.name, c.email, c.city, SUM(o.total_amount) AS total_spent
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email, c.city
ORDER BY total_spent DESC
LIMIT 3`,
    },

    {
      title: "Products Never Ordered",
      description: "Use LEFT JOIN or NOT IN to find products with no orders. Classic set-difference pattern.",
      difficulty: "medium" as const,
      question: `Find all products that have never been ordered.\nReturn the product name, category, and price.\nOrder by category, then by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, price",
      solutionQuery: `SELECT p.name, p.category, p.price
FROM assignment_ecommerce.products p
LEFT JOIN assignment_ecommerce.orders o ON p.id = o.product_id
WHERE o.id IS NULL
ORDER BY p.category, p.name`,
    },

    {
      title: "Monthly Revenue Report",
      description: "Aggregate orders by month. Practice date functions and GROUP BY.",
      difficulty: "medium" as const,
      question: `Calculate total revenue per month.\nReturn the year, month number, and total_revenue (sum of total_amount).\nOnly include months where revenue exceeds 500.\nOrder by year and month ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue",
      solutionQuery: `SELECT
  EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
  EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
  SUM(total_amount) AS total_revenue
FROM assignment_ecommerce.orders
GROUP BY year, month
HAVING SUM(total_amount) > 500
ORDER BY year, month`,
    },

    {
      title: "Revenue by Product Category",
      description: "Join orders and products to see which category drives the most revenue.",
      difficulty: "easy" as const,
      question: `Calculate total revenue for each product category.\nReturn category and total_revenue (sum of order total_amounts for products in that category).\nOrder by total_revenue descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "products"],
      expectedColumns: "category, total_revenue",
      solutionQuery: `SELECT p.category, SUM(o.total_amount) AS total_revenue
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.products p ON o.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC`,
    },

    {
      title: "Customers with Multiple Orders",
      description: "Find customers who have placed more than one order. HAVING clause practice.",
      difficulty: "easy" as const,
      question: `Find all customers who have placed more than 1 order.\nReturn their name, email, and order_count.\nOrder by order_count descending, then name ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, order_count",
      solutionQuery: `SELECT c.name, c.email, COUNT(o.id) AS order_count
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(o.id) > 1
ORDER BY order_count DESC, c.name ASC`,
    },

    {
      title: "Running Total Order Revenue",
      description: "Use a window function to compute a running total of revenue across all orders.",
      difficulty: "hard" as const,
      question: `Calculate a running total of revenue ordered by order date.\nReturn order id, ordered_at (date only), total_amount, and running_total.\nOrder by ordered_at, then id.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, ordered_at, total_amount, running_total",
      solutionQuery: `SELECT
  id,
  ordered_at::DATE AS ordered_at,
  total_amount,
  SUM(total_amount) OVER (ORDER BY ordered_at, id) AS running_total
FROM assignment_ecommerce.orders
ORDER BY ordered_at, id`,
    },

    {
      title: "Most Expensive Product Per Category",
      description: "Find the most expensive product in each category using GROUP BY and MAX.",
      difficulty: "easy" as const,
      question: `For each product category, find the maximum price.\nReturn category and max_price.\nOrder by max_price descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "category, max_price",
      solutionQuery: `SELECT category, MAX(price) AS max_price
FROM assignment_ecommerce.products
GROUP BY category
ORDER BY max_price DESC`,
    },

    {
      title: "Customer Order Summary",
      description: "Summarise order count and total amount per customer.",
      difficulty: "easy" as const,
      question: `For each customer, return their name, total number of orders (order_count), and total amount spent (total_spent).\nOnly include customers who have at least one order.\nOrder by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, order_count, total_spent",
      solutionQuery: `SELECT c.name, COUNT(o.id) AS order_count, SUM(o.total_amount) AS total_spent
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC`,
    },

    {
      title: "Products with Low Stock",
      description: "Filter products with a WHERE clause on a numeric column.",
      difficulty: "easy" as const,
      question: `Find all products where stock is less than 50.\nReturn name, category, price, and stock.\nOrder by stock ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, category, price, stock",
      solutionQuery: `SELECT name, category, price, stock
FROM assignment_ecommerce.products
WHERE stock < 50
ORDER BY stock ASC`,
    },

    {
      title: "Orders Above Average Amount",
      description: "Use a subquery to filter orders above the average order value.",
      difficulty: "medium" as const,
      question: `Find all orders where total_amount is greater than the average total_amount across all orders.\nReturn id, total_amount, and ordered_at.\nOrder by total_amount descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, ordered_at",
      solutionQuery: `SELECT id, total_amount, ordered_at
FROM assignment_ecommerce.orders
WHERE total_amount > (SELECT AVG(total_amount) FROM assignment_ecommerce.orders)
ORDER BY total_amount DESC`,
    },

    {
      title: "Customers Who Never Ordered",
      description: "Use LEFT JOIN and NULL check to find customers with no orders.",
      difficulty: "medium" as const,
      question: `Find all customers who have never placed an order.\nReturn name, email, and city.\nOrder by name ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, city",
      solutionQuery: `SELECT c.name, c.email, c.city
FROM assignment_ecommerce.customers c
LEFT JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
WHERE o.id IS NULL
ORDER BY c.name`,
    },

    {
      title: "Average Order Value by Customer City",
      description: "Multi-table JOIN with GROUP BY on a derived field.",
      difficulty: "medium" as const,
      question: `Calculate the average order value grouped by customer city.\nReturn city and avg_order_value (rounded to 2 decimal places).\nOrder by avg_order_value descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "city, avg_order_value",
      solutionQuery: `SELECT c.city, ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.city
ORDER BY avg_order_value DESC`,
    },

    {
      title: "Top Selling Products by Quantity",
      description: "Aggregate quantity sold per product.",
      difficulty: "easy" as const,
      question: `Find the top 5 products by total quantity sold.\nReturn product name, category, and total_quantity_sold.\nOrder by total_quantity_sold descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, total_quantity_sold",
      solutionQuery: `SELECT p.name, p.category, SUM(o.quantity) AS total_quantity_sold
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name, p.category
ORDER BY total_quantity_sold DESC
LIMIT 5`,
    },

    {
      title: "Order Rank by Amount",
      description: "Use RANK() to rank orders by their total amount.",
      difficulty: "medium" as const,
      question: `Rank all orders by total_amount in descending order.\nReturn id, total_amount, ordered_at, and amount_rank.\nOrder by amount_rank.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, ordered_at, amount_rank",
      solutionQuery: `SELECT
  id,
  total_amount,
  ordered_at,
  RANK() OVER (ORDER BY total_amount DESC) AS amount_rank
FROM assignment_ecommerce.orders
ORDER BY amount_rank`,
    },

    {
      title: "Customers Joined in Q1 2023",
      description: "Filter rows using date range conditions.",
      difficulty: "easy" as const,
      question: `Find all customers who joined in Q1 2023 (January, February, or March 2023).\nReturn name, email, and joined_at.\nOrder by joined_at ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "name, email, joined_at",
      solutionQuery: `SELECT name, email, joined_at
FROM assignment_ecommerce.customers
WHERE joined_at >= '2023-01-01' AND joined_at < '2023-04-01'
ORDER BY joined_at ASC`,
    },

    {
      title: "Daily Order Count",
      description: "Group orders by date to find order volume per day.",
      difficulty: "easy" as const,
      question: `Count the number of orders placed each day.\nReturn order_date (ordered_at cast to DATE) and order_count.\nOrder by order_date ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "order_date, order_count",
      solutionQuery: `SELECT ordered_at::DATE AS order_date, COUNT(*) AS order_count
FROM assignment_ecommerce.orders
GROUP BY order_date
ORDER BY order_date ASC`,
    },

    {
      title: "Products Ordered More Than Once",
      description: "Use HAVING to filter products that appear in multiple orders.",
      difficulty: "medium" as const,
      question: `Find all products that appear in more than 1 order.\nReturn product name, category, and order_count.\nOrder by order_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, order_count",
      solutionQuery: `SELECT p.name, p.category, COUNT(o.id) AS order_count
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name, p.category
HAVING COUNT(o.id) > 1
ORDER BY order_count DESC`,
    },

    {
      title: "Customer with Highest Single Order",
      description: "Find the customer whose single largest order is the biggest.",
      difficulty: "medium" as const,
      question: `Find the customer who placed the single highest-value order.\nReturn name, email, and max_order_amount.\nIf tied, return all tied customers.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, max_order_amount",
      solutionQuery: `SELECT c.name, c.email, MAX(o.total_amount) AS max_order_amount
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING MAX(o.total_amount) = (SELECT MAX(total_amount) FROM assignment_ecommerce.orders)`,
    },

    {
      title: "Product Revenue Contribution Percentage",
      description: "Calculate each product's share of total revenue.",
      difficulty: "hard" as const,
      question: `For each product, calculate its revenue as a percentage of total revenue.\nReturn product name, product_revenue, and revenue_pct (rounded to 2 decimal places).\nOrder by revenue_pct descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, product_revenue, revenue_pct",
      solutionQuery: `SELECT
  p.name,
  SUM(o.total_amount) AS product_revenue,
  ROUND(SUM(o.total_amount) * 100.0 / (SELECT SUM(total_amount) FROM assignment_ecommerce.orders), 2) AS revenue_pct
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name
ORDER BY revenue_pct DESC`,
    },

    {
      title: "Electronics Products Above 100",
      description: "Filter products by category and price threshold.",
      difficulty: "easy" as const,
      question: `Find all Electronics products priced above $100.\nReturn name, price, and stock.\nOrder by price descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, price, stock",
      solutionQuery: `SELECT name, price, stock
FROM assignment_ecommerce.products
WHERE category = 'Electronics' AND price > 100
ORDER BY price DESC`,
    },

    {
      title: "Customers from New York with Orders",
      description: "Combine city filter with JOIN to orders.",
      difficulty: "medium" as const,
      question: `Find all customers from New York who have placed at least one order.\nReturn name, email, and order_count.\nOrder by order_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, order_count",
      solutionQuery: `SELECT c.name, c.email, COUNT(o.id) AS order_count
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
WHERE c.city = 'New York'
GROUP BY c.id, c.name, c.email
ORDER BY order_count DESC`,
    },

    {
      title: "Nth Highest Order Amount",
      description: "Use DENSE_RANK to find the 2nd highest order amount.",
      difficulty: "hard" as const,
      question: `Find all orders with the 2nd highest total_amount.\nReturn id, total_amount, and ordered_at.\nUse a window function approach.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, ordered_at",
      solutionQuery: `WITH ranked AS (
  SELECT id, total_amount, ordered_at,
    DENSE_RANK() OVER (ORDER BY total_amount DESC) AS rnk
  FROM assignment_ecommerce.orders
)
SELECT id, total_amount, ordered_at
FROM ranked
WHERE rnk = 2`,
    },

    {
      title: "Month-over-Month Revenue Growth",
      description: "Use LAG to compare each month's revenue to the previous month.",
      difficulty: "hard" as const,
      question: `Calculate monthly revenue and the difference from the previous month.\nReturn year, month, total_revenue, and revenue_change (current month minus previous month, NULL for the first month).\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue, revenue_change",
      solutionQuery: `WITH monthly AS (
  SELECT
    EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS total_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
)
SELECT
  year, month, total_revenue,
  total_revenue - LAG(total_revenue) OVER (ORDER BY year, month) AS revenue_change
FROM monthly
ORDER BY year, month`,
    },

    {
      title: "Customer First and Last Order",
      description: "Use MIN and MAX aggregate functions on dates.",
      difficulty: "medium" as const,
      question: `For each customer, find their first and last order dates.\nReturn name, first_order (earliest ordered_at date), and last_order (latest ordered_at date).\nOnly include customers who have at least one order.\nOrder by first_order ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, first_order, last_order",
      solutionQuery: `SELECT c.name, MIN(o.ordered_at)::DATE AS first_order, MAX(o.ordered_at)::DATE AS last_order
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY first_order ASC`,
    },

    {
      title: "Orders in January 2024",
      description: "Filter with date range on timestamp column.",
      difficulty: "easy" as const,
      question: `Find all orders placed in January 2024.\nReturn id, total_amount, and ordered_at.\nOrder by ordered_at ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, ordered_at",
      solutionQuery: `SELECT id, total_amount, ordered_at
FROM assignment_ecommerce.orders
WHERE ordered_at >= '2024-01-01' AND ordered_at < '2024-02-01'
ORDER BY ordered_at ASC`,
    },

    {
      title: "Products with Above-Average Price",
      description: "Use a scalar subquery to compare each row to the average.",
      difficulty: "medium" as const,
      question: `Find all products whose price is above the average price of all products.\nReturn name, category, and price.\nOrder by price descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, category, price",
      solutionQuery: `SELECT name, category, price
FROM assignment_ecommerce.products
WHERE price > (SELECT AVG(price) FROM assignment_ecommerce.products)
ORDER BY price DESC`,
    },

    {
      title: "Number of Products per Category",
      description: "Simple GROUP BY count on a single table.",
      difficulty: "easy" as const,
      question: `Count the number of products in each category.\nReturn category and product_count.\nOrder by product_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "category, product_count",
      solutionQuery: `SELECT category, COUNT(*) AS product_count
FROM assignment_ecommerce.products
GROUP BY category
ORDER BY product_count DESC`,
    },

    {
      title: "Total Stock Value by Category",
      description: "Calculate stock × price to find inventory value.",
      difficulty: "medium" as const,
      question: `For each category, calculate the total stock value (price * stock summed for all products).\nReturn category and total_stock_value (rounded to 2 decimal places).\nOrder by total_stock_value descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "category, total_stock_value",
      solutionQuery: `SELECT category, ROUND(SUM(price * stock), 2) AS total_stock_value
FROM assignment_ecommerce.products
GROUP BY category
ORDER BY total_stock_value DESC`,
    },

    {
      title: "Order Count per Product",
      description: "Count how many times each product was ordered.",
      difficulty: "easy" as const,
      question: `Count how many orders each product has received.\nReturn product name, category, and times_ordered.\nInclude products with zero orders too.\nOrder by times_ordered descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, times_ordered",
      solutionQuery: `SELECT p.name, p.category, COUNT(o.id) AS times_ordered
FROM assignment_ecommerce.products p
LEFT JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name, p.category
ORDER BY times_ordered DESC`,
    },

    {
      title: "Customers Ordered Both Electronics and Books",
      description: "Find customers who purchased from multiple categories using self-join or HAVING with EXISTS.",
      difficulty: "hard" as const,
      question: `Find customers who have ordered at least one Electronics product AND at least one Books product.\nReturn customer name and email.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders", "products"],
      expectedColumns: "name, email",
      solutionQuery: `SELECT DISTINCT c.name, c.email
FROM assignment_ecommerce.customers c
WHERE EXISTS (
  SELECT 1 FROM assignment_ecommerce.orders o
  JOIN assignment_ecommerce.products p ON o.product_id = p.id
  WHERE o.customer_id = c.id AND p.category = 'Electronics'
)
AND EXISTS (
  SELECT 1 FROM assignment_ecommerce.orders o
  JOIN assignment_ecommerce.products p ON o.product_id = p.id
  WHERE o.customer_id = c.id AND p.category = 'Books'
)
ORDER BY c.name`,
    },

    {
      title: "Latest Order per Customer",
      description: "Use window functions to find the most recent order per customer.",
      difficulty: "hard" as const,
      question: `For each customer, return their most recent order.\nReturn customer name, order id, total_amount, and ordered_at.\nOrder by ordered_at descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, id, total_amount, ordered_at",
      solutionQuery: `WITH ranked AS (
  SELECT c.name, o.id, o.total_amount, o.ordered_at,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.ordered_at DESC) AS rn
  FROM assignment_ecommerce.customers c
  JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
)
SELECT name, id, total_amount, ordered_at
FROM ranked
WHERE rn = 1
ORDER BY ordered_at DESC`,
    },

    {
      title: "Cumulative Revenue by Customer",
      description: "Use SUM window function partitioned by customer.",
      difficulty: "hard" as const,
      question: `For each order, show the running total revenue for that customer up to and including that order.\nReturn customer name, order id, ordered_at, total_amount, and customer_running_total.\nOrder by customer name, then ordered_at.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, id, ordered_at, total_amount, customer_running_total",
      solutionQuery: `SELECT
  c.name,
  o.id,
  o.ordered_at,
  o.total_amount,
  SUM(o.total_amount) OVER (PARTITION BY c.id ORDER BY o.ordered_at, o.id) AS customer_running_total
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
ORDER BY c.name, o.ordered_at`,
    },

    {
      title: "Products Ordered in February 2024",
      description: "Join products and orders with a date filter.",
      difficulty: "medium" as const,
      question: `Find all products that were ordered in February 2024.\nReturn product name, category, and the number of orders in that month as feb_orders.\nOrder by feb_orders descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, feb_orders",
      solutionQuery: `SELECT p.name, p.category, COUNT(o.id) AS feb_orders
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
WHERE ordered_at >= '2024-02-01' AND ordered_at < '2024-03-01'
GROUP BY p.id, p.name, p.category
ORDER BY feb_orders DESC`,
    },

    {
      title: "Customer Spending Percentile",
      description: "Use PERCENT_RANK to find spending percentile for each customer.",
      difficulty: "hard" as const,
      question: `Calculate the spending percentile for each customer.\nReturn name, total_spent, and spend_percentile (PERCENT_RANK rounded to 2 decimals).\nOrder by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, total_spent, spend_percentile",
      solutionQuery: `WITH spending AS (
  SELECT c.name, SUM(o.total_amount) AS total_spent
  FROM assignment_ecommerce.customers c
  JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, total_spent,
  ROUND(PERCENT_RANK() OVER (ORDER BY total_spent)::NUMERIC, 2) AS spend_percentile
FROM spending
ORDER BY total_spent DESC`,
    },

    {
      title: "Average Days Between Orders",
      description: "Use LAG to calculate the gap between consecutive orders.",
      difficulty: "hard" as const,
      question: `For each customer, calculate the average number of days between consecutive orders.\nReturn name and avg_days_between_orders (rounded to 1 decimal).\nOnly include customers with more than 1 order.\nOrder by avg_days_between_orders.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, avg_days_between_orders",
      solutionQuery: `WITH ordered_orders AS (
  SELECT c.id AS cid, c.name,
    o.ordered_at,
    LAG(o.ordered_at) OVER (PARTITION BY c.id ORDER BY o.ordered_at) AS prev_order
  FROM assignment_ecommerce.customers c
  JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
),
gaps AS (
  SELECT cid, name,
    EXTRACT(EPOCH FROM (ordered_at - prev_order))/86400 AS days_gap
  FROM ordered_orders
  WHERE prev_order IS NOT NULL
)
SELECT name, ROUND(AVG(days_gap)::NUMERIC, 1) AS avg_days_between_orders
FROM gaps
GROUP BY cid, name
ORDER BY avg_days_between_orders`,
    },

    {
      title: "Top Product per Category",
      description: "Use DISTINCT ON or ROW_NUMBER to get the best seller in each category.",
      difficulty: "hard" as const,
      question: `For each product category, find the product with the highest total revenue.\nReturn category, product name, and category_revenue.\nOrder by category_revenue descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "category, name, category_revenue",
      solutionQuery: `WITH product_revenue AS (
  SELECT p.category, p.name, SUM(o.total_amount) AS category_revenue,
    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(o.total_amount) DESC) AS rn
  FROM assignment_ecommerce.products p
  JOIN assignment_ecommerce.orders o ON p.id = o.product_id
  GROUP BY p.category, p.id, p.name
)
SELECT category, name, category_revenue
FROM product_revenue
WHERE rn = 1
ORDER BY category_revenue DESC`,
    },

    {
      title: "Orders with Product and Customer Details",
      description: "Three-table JOIN to produce a full order details report.",
      difficulty: "medium" as const,
      question: `List all orders with customer name, product name, quantity, and total_amount.\nOrder by ordered_at descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "customers", "products"],
      expectedColumns: "customer_name, product_name, quantity, total_amount, ordered_at",
      solutionQuery: `SELECT c.name AS customer_name, p.name AS product_name,
  o.quantity, o.total_amount, o.ordered_at
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.customers c ON o.customer_id = c.id
JOIN assignment_ecommerce.products p ON o.product_id = p.id
ORDER BY o.ordered_at DESC`,
    },

    {
      title: "Revenue Growth Rate by Month",
      description: "Calculate percentage growth in revenue month over month.",
      difficulty: "hard" as const,
      question: `Calculate the month-over-month revenue growth percentage.\nReturn year, month, total_revenue, and growth_pct (rounded to 1 decimal, NULL for the first month).\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue, growth_pct",
      solutionQuery: `WITH monthly AS (
  SELECT
    EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS total_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
)
SELECT year, month, total_revenue,
  ROUND(
    ((total_revenue - LAG(total_revenue) OVER (ORDER BY year, month))
    / LAG(total_revenue) OVER (ORDER BY year, month) * 100)::NUMERIC,
    1
  ) AS growth_pct
FROM monthly
ORDER BY year, month`,
    },

    {
      title: "Count Distinct Customers per Month",
      description: "Count unique customers placing orders each month.",
      difficulty: "medium" as const,
      question: `Count the number of distinct customers who placed orders each month.\nReturn year, month, and unique_customers.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, unique_customers",
      solutionQuery: `SELECT
  EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
  EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
  COUNT(DISTINCT customer_id) AS unique_customers
FROM assignment_ecommerce.orders
GROUP BY year, month
ORDER BY year, month`,
    },

    {
      title: "Price Buckets",
      description: "Use CASE to categorize products into price ranges.",
      difficulty: "medium" as const,
      question: `Categorize all products into price buckets: 'Budget' (< 50), 'Mid-range' (50-299), 'Premium' (300+).\nReturn name, price, and price_bucket.\nOrder by price ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, price, price_bucket",
      solutionQuery: `SELECT name, price,
  CASE
    WHEN price < 50 THEN 'Budget'
    WHEN price < 300 THEN 'Mid-range'
    ELSE 'Premium'
  END AS price_bucket
FROM assignment_ecommerce.products
ORDER BY price ASC`,
    },

    {
      title: "Customers Who Spent Over 500",
      description: "Filter using HAVING after aggregation.",
      difficulty: "easy" as const,
      question: `Find all customers who have spent more than $500 in total.\nReturn name, email, and total_spent.\nOrder by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, total_spent",
      solutionQuery: `SELECT c.name, c.email, SUM(o.total_amount) AS total_spent
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING SUM(o.total_amount) > 500
ORDER BY total_spent DESC`,
    },

    {
      title: "Product Sales Rank",
      description: "Rank products by total revenue using RANK().",
      difficulty: "medium" as const,
      question: `Rank each product by total revenue earned from orders.\nReturn product name, total_revenue, and sales_rank.\nOrder by sales_rank.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, total_revenue, sales_rank",
      solutionQuery: `SELECT p.name,
  SUM(o.total_amount) AS total_revenue,
  RANK() OVER (ORDER BY SUM(o.total_amount) DESC) AS sales_rank
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name
ORDER BY sales_rank`,
    },

    {
      title: "New Customers Each Month",
      description: "Count customers who joined in each month.",
      difficulty: "easy" as const,
      question: `Count how many new customers joined each month.\nReturn year, month, and new_customers.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "year, month, new_customers",
      solutionQuery: `SELECT
  EXTRACT(YEAR FROM joined_at)::INTEGER AS year,
  EXTRACT(MONTH FROM joined_at)::INTEGER AS month,
  COUNT(*) AS new_customers
FROM assignment_ecommerce.customers
GROUP BY year, month
ORDER BY year, month`,
    },

    {
      title: "Percentage of Orders per Category",
      description: "Calculate each category's share of total orders.",
      difficulty: "hard" as const,
      question: `Calculate the percentage of total orders that each product category represents.\nReturn category, order_count, and order_pct (rounded to 1 decimal).\nOrder by order_pct descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "category, order_count, order_pct",
      solutionQuery: `SELECT p.category,
  COUNT(o.id) AS order_count,
  ROUND(COUNT(o.id) * 100.0 / (SELECT COUNT(*) FROM assignment_ecommerce.orders), 1) AS order_pct
FROM assignment_ecommerce.products p
JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.category
ORDER BY order_pct DESC`,
    },

    {
      title: "Customer Retention - Orders Across Multiple Months",
      description: "Identify customers active in more than one month.",
      difficulty: "hard" as const,
      question: `Find customers who placed orders in more than one distinct month.\nReturn name, email, and active_months (count of distinct months).\nOrder by active_months descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, active_months",
      solutionQuery: `SELECT c.name, c.email,
  COUNT(DISTINCT DATE_TRUNC('month', o.ordered_at)) AS active_months
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(DISTINCT DATE_TRUNC('month', o.ordered_at)) > 1
ORDER BY active_months DESC`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // HR QUESTIONS (60–120)
    // ═══════════════════════════════════════════════════════════════════════════

    {
      title: "Highest Paid Employees per Department",
      description: "Use DISTINCT ON or subqueries to find the top earner in each department.",
      difficulty: "hard" as const,
      question: `For each department, find the employee with the highest salary.\nReturn the department name, employee name, and their salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, employee_name, salary",
      solutionQuery: `SELECT DISTINCT ON (d.id)
  d.name AS department_name,
  e.name AS employee_name,
  e.salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY d.id, e.salary DESC`,
    },

    {
      title: "Average Salary by Department",
      description: "Simple GROUP BY with aggregation. Great for beginners.",
      difficulty: "easy" as const,
      question: `Calculate the average salary for each department.\nReturn the department name and avg_salary rounded to 2 decimal places.\nOnly include departments with more than 1 employee.\nOrder by avg_salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, avg_salary",
      solutionQuery: `SELECT d.name AS department_name, ROUND(AVG(e.salary), 2) AS avg_salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name
HAVING COUNT(e.id) > 1
ORDER BY avg_salary DESC`,
    },

    {
      title: "Department Budget Utilization",
      description: "Calculate what percentage of each department's budget is used by total salaries.",
      difficulty: "medium" as const,
      question: `For each department, calculate total salary spend and the percentage of the budget used.\nReturn department name, total_salary, budget, and utilization_pct (rounded to 1 decimal).\nOrder by utilization_pct descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, total_salary, budget, utilization_pct",
      solutionQuery: `SELECT
  d.name AS department_name,
  SUM(e.salary) AS total_salary,
  d.budget,
  ROUND((SUM(e.salary) / d.budget * 100)::NUMERIC, 1) AS utilization_pct
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name, d.budget
ORDER BY utilization_pct DESC`,
    },

    {
      title: "Employee Salary Rank within Department",
      description: "Use RANK() window function to rank employees by salary inside each department.",
      difficulty: "hard" as const,
      question: `Rank each employee by salary within their department (highest = rank 1).\nReturn employee name, department name, salary, and salary_rank.\nOrder by department name, then salary_rank.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "employee_name, department_name, salary, salary_rank",
      solutionQuery: `SELECT
  e.name AS employee_name,
  d.name AS department_name,
  e.salary,
  RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) AS salary_rank
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY d.name, salary_rank`,
    },

    {
      title: "Employees Hired After 2020",
      description: "Filter employees by hire date.",
      difficulty: "easy" as const,
      question: `Find all employees hired after January 1, 2020.\nReturn name, department_id, salary, and hire_date.\nOrder by hire_date ascending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, hire_date",
      solutionQuery: `SELECT e.name, e.salary, e.hire_date
FROM assignment_hr.employees e
WHERE e.hire_date > '2020-01-01'
ORDER BY e.hire_date ASC`,
    },

    {
      title: "Headcount per Department",
      description: "Count employees in each department.",
      difficulty: "easy" as const,
      question: `Count the number of employees in each department.\nReturn department name and employee_count.\nOrder by employee_count descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, employee_count",
      solutionQuery: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM assignment_hr.departments d
LEFT JOIN assignment_hr.employees e ON d.id = e.department_id
GROUP BY d.id, d.name
ORDER BY employee_count DESC`,
    },

    {
      title: "Salary Above Department Average",
      description: "Use a correlated subquery to find above-average earners within their dept.",
      difficulty: "hard" as const,
      question: `Find employees whose salary is above the average salary of their own department.\nReturn employee name, department name, salary, and dept_avg_salary (rounded to 2 decimals).\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "employee_name, department_name, salary, dept_avg_salary",
      solutionQuery: `SELECT e.name AS employee_name, d.name AS department_name, e.salary,
  ROUND(dept_avg.avg_salary, 2) AS dept_avg_salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
JOIN (
  SELECT department_id, AVG(salary) AS avg_salary
  FROM assignment_hr.employees
  GROUP BY department_id
) dept_avg ON e.department_id = dept_avg.department_id
WHERE e.salary > dept_avg.avg_salary
ORDER BY e.salary DESC`,
    },

    {
      title: "Managers and Their Direct Reports",
      description: "Self-join to match managers with their direct reports.",
      difficulty: "medium" as const,
      question: `List all managers and how many direct reports they have.\nReturn manager name and direct_reports count.\nOrder by direct_reports descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "manager_name, direct_reports",
      solutionQuery: `SELECT m.name AS manager_name, COUNT(e.id) AS direct_reports
FROM assignment_hr.employees e
JOIN assignment_hr.employees m ON e.manager_id = m.id
GROUP BY m.id, m.name
ORDER BY direct_reports DESC`,
    },

    {
      title: "Employees Without a Manager",
      description: "Find top-level employees using NULL check on manager_id.",
      difficulty: "easy" as const,
      question: `Find all employees who do not have a manager (they are top-level).\nReturn their name, department name, and salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, salary",
      solutionQuery: `SELECT e.name, d.name AS department_name, e.salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
WHERE e.manager_id IS NULL
ORDER BY e.salary DESC`,
    },

    {
      title: "Department with Highest Total Salary",
      description: "Aggregate salaries and find the top department.",
      difficulty: "medium" as const,
      question: `Find the department with the highest total salary bill.\nReturn department name and total_salary.\nReturn only the top 1 result.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, total_salary",
      solutionQuery: `SELECT d.name AS department_name, SUM(e.salary) AS total_salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY total_salary DESC
LIMIT 1`,
    },

    {
      title: "Employee Tenure in Years",
      description: "Calculate how long each employee has worked using date arithmetic.",
      difficulty: "medium" as const,
      question: `Calculate the tenure in years for each employee (from hire_date to today).\nReturn employee name, hire_date, and tenure_years (as an integer, floor).\nOrder by tenure_years descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, hire_date, tenure_years",
      solutionQuery: `SELECT name, hire_date,
  FLOOR(EXTRACT(EPOCH FROM (CURRENT_DATE - hire_date)) / (365.25 * 86400))::INTEGER AS tenure_years
FROM assignment_hr.employees
ORDER BY tenure_years DESC`,
    },

    {
      title: "Salary Quartiles",
      description: "Use NTILE to divide employees into salary quartiles.",
      difficulty: "hard" as const,
      question: `Assign each employee to a salary quartile (1 = lowest, 4 = highest).\nReturn employee name, salary, and salary_quartile.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, salary_quartile",
      solutionQuery: `SELECT name, salary,
  NTILE(4) OVER (ORDER BY salary) AS salary_quartile
FROM assignment_hr.employees
ORDER BY salary DESC`,
    },

    {
      title: "Departments Under Budget",
      description: "Find departments where total salary is below the allocated budget.",
      difficulty: "medium" as const,
      question: `Find departments where the total salary of all employees is less than the department budget.\nReturn department name, total_salary, and budget.\nOrder by budget - total_salary descending (most budget remaining first).`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, total_salary, budget",
      solutionQuery: `SELECT d.name AS department_name, SUM(e.salary) AS total_salary, d.budget
FROM assignment_hr.departments d
LEFT JOIN assignment_hr.employees e ON d.id = e.department_id
GROUP BY d.id, d.name, d.budget
HAVING SUM(e.salary) < d.budget OR SUM(e.salary) IS NULL
ORDER BY (d.budget - COALESCE(SUM(e.salary), 0)) DESC`,
    },

    {
      title: "Second Highest Salary",
      description: "Find the employee with the 2nd highest salary using DENSE_RANK.",
      difficulty: "hard" as const,
      question: `Find the employee(s) with the 2nd highest salary overall.\nReturn name, department name, and salary.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, salary",
      solutionQuery: `WITH ranked AS (
  SELECT e.name, d.name AS department_name, e.salary,
    DENSE_RANK() OVER (ORDER BY e.salary DESC) AS rnk
  FROM assignment_hr.employees e
  JOIN assignment_hr.departments d ON e.department_id = d.id
)
SELECT name, department_name, salary
FROM ranked
WHERE rnk = 2`,
    },

    {
      title: "Employees Earning More Than Their Manager",
      description: "Self-join to compare employee salary to their manager's salary.",
      difficulty: "hard" as const,
      question: `Find all employees whose salary is greater than their manager's salary.\nReturn employee name, employee salary, manager name, and manager salary.\nOrder by employee salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "employee_name, employee_salary, manager_name, manager_salary",
      solutionQuery: `SELECT e.name AS employee_name, e.salary AS employee_salary,
  m.name AS manager_name, m.salary AS manager_salary
FROM assignment_hr.employees e
JOIN assignment_hr.employees m ON e.manager_id = m.id
WHERE e.salary > m.salary
ORDER BY e.salary DESC`,
    },

    {
      title: "Average Salary Across All Departments",
      description: "Simple AVG aggregation across the whole table.",
      difficulty: "easy" as const,
      question: `Calculate the overall average salary of all employees.\nReturn a single value: overall_avg_salary rounded to 2 decimal places.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "overall_avg_salary",
      solutionQuery: `SELECT ROUND(AVG(salary), 2) AS overall_avg_salary
FROM assignment_hr.employees`,
    },

    {
      title: "New Hires Per Year",
      description: "Count employees hired each year.",
      difficulty: "easy" as const,
      question: `Count how many employees were hired each year.\nReturn hire_year and employee_count.\nOrder by hire_year ascending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "hire_year, employee_count",
      solutionQuery: `SELECT EXTRACT(YEAR FROM hire_date)::INTEGER AS hire_year, COUNT(*) AS employee_count
FROM assignment_hr.employees
GROUP BY hire_year
ORDER BY hire_year ASC`,
    },

    {
      title: "Employees in Engineering Department",
      description: "Filter employees by department name using a JOIN.",
      difficulty: "easy" as const,
      question: `List all employees in the Engineering department.\nReturn employee name, salary, and hire_date.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, salary, hire_date",
      solutionQuery: `SELECT e.name, e.salary, e.hire_date
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
WHERE d.name = 'Engineering'
ORDER BY e.salary DESC`,
    },

    {
      title: "Salary Band Count",
      description: "Use CASE to bin employees into salary bands and count each.",
      difficulty: "medium" as const,
      question: `Group employees into salary bands: 'Junior' (< 80000), 'Mid' (80000-99999), 'Senior' (100000+).\nReturn salary_band and employee_count.\nOrder by employee_count descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "salary_band, employee_count",
      solutionQuery: `SELECT
  CASE
    WHEN salary < 80000 THEN 'Junior'
    WHEN salary < 100000 THEN 'Mid'
    ELSE 'Senior'
  END AS salary_band,
  COUNT(*) AS employee_count
FROM assignment_hr.employees
GROUP BY salary_band
ORDER BY employee_count DESC`,
    },

    {
      title: "Departments with No Employees",
      description: "Use LEFT JOIN and NULL check to find empty departments.",
      difficulty: "medium" as const,
      question: `Find all departments that have no employees assigned.\nReturn department name and budget.`,
      sandboxSchema: "assignment_hr",
      tables: ["departments", "employees"],
      expectedColumns: "name, budget",
      solutionQuery: `SELECT d.name, d.budget
FROM assignment_hr.departments d
LEFT JOIN assignment_hr.employees e ON d.id = e.department_id
WHERE e.id IS NULL`,
    },

    {
      title: "Employee Salary Difference from Department Average",
      description: "Calculate how much each employee's salary differs from their dept average.",
      difficulty: "hard" as const,
      question: `For each employee, calculate the difference between their salary and their department's average salary.\nReturn name, department name, salary, and salary_diff (salary minus dept average, rounded to 2 decimals).\nOrder by salary_diff descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, salary, salary_diff",
      solutionQuery: `SELECT e.name, d.name AS department_name, e.salary,
  ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY e.department_id), 2) AS salary_diff
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY salary_diff DESC`,
    },

    {
      title: "ROW_NUMBER for Employee Seniority",
      description: "Assign a seniority rank within each department based on hire date.",
      difficulty: "medium" as const,
      question: `Assign a seniority number to each employee within their department based on hire_date (earliest = 1).\nReturn name, department name, hire_date, and seniority_rank.\nOrder by department name, then seniority_rank.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, hire_date, seniority_rank",
      solutionQuery: `SELECT e.name, d.name AS department_name, e.hire_date,
  ROW_NUMBER() OVER (PARTITION BY e.department_id ORDER BY e.hire_date) AS seniority_rank
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY d.name, seniority_rank`,
    },

    {
      title: "Total Salary Cost by Manager",
      description: "Sum salaries of all direct reports per manager.",
      difficulty: "hard" as const,
      question: `For each manager, calculate the total salary of their direct reports.\nReturn manager name and total_reports_salary.\nOrder by total_reports_salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "manager_name, total_reports_salary",
      solutionQuery: `SELECT m.name AS manager_name, SUM(e.salary) AS total_reports_salary
FROM assignment_hr.employees e
JOIN assignment_hr.employees m ON e.manager_id = m.id
GROUP BY m.id, m.name
ORDER BY total_reports_salary DESC`,
    },

    {
      title: "Oldest Employee per Department",
      description: "Find the longest-serving employee in each department.",
      difficulty: "medium" as const,
      question: `Find the employee with the earliest hire_date in each department.\nReturn department name, employee name, and hire_date.\nOrder by hire_date ascending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, employee_name, hire_date",
      solutionQuery: `SELECT DISTINCT ON (d.id)
  d.name AS department_name, e.name AS employee_name, e.hire_date
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY d.id, e.hire_date ASC`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SCHOOL QUESTIONS (120–170)
    // ═══════════════════════════════════════════════════════════════════════════

    {
      title: "Students with GPA above 3.5",
      description: "Calculate GPA across multiple enrollments. Multi-table aggregation with HAVING.",
      difficulty: "medium" as const,
      question: `Find all students whose average grade across all enrolled courses is above 3.5.\nReturn student name, grade_level, and their gpa (average grade rounded to 2 decimals).\nOrder by gpa descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level, gpa",
      solutionQuery: `SELECT s.name, s.grade_level, ROUND(AVG(e.grade), 2) AS gpa
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name, s.grade_level
HAVING AVG(e.grade) > 3.5
ORDER BY gpa DESC`,
    },

    {
      title: "Course Enrollment Count",
      description: "Count how many students are enrolled in each course.",
      difficulty: "easy" as const,
      question: `For each course, count how many students are enrolled.\nReturn the course name, instructor, and enrollment_count.\nOrder by enrollment_count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, instructor, enrollment_count",
      solutionQuery: `SELECT c.name, c.instructor, COUNT(e.student_id) AS enrollment_count
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name, c.instructor
ORDER BY enrollment_count DESC`,
    },

    {
      title: "Students Enrolled in Most Courses",
      description: "Find students taking the most courses.",
      difficulty: "easy" as const,
      question: `Find the top 3 students by number of courses enrolled.\nReturn student name and course_count.\nOrder by course_count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, course_count",
      solutionQuery: `SELECT s.name, COUNT(e.course_id) AS course_count
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name
ORDER BY course_count DESC
LIMIT 3`,
    },

    {
      title: "Average Grade per Course",
      description: "Compute average grade per course.",
      difficulty: "easy" as const,
      question: `Calculate the average grade for each course.\nReturn course name and avg_grade (rounded to 2 decimal places).\nOrder by avg_grade descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, avg_grade",
      solutionQuery: `SELECT c.name, ROUND(AVG(e.grade), 2) AS avg_grade
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name
ORDER BY avg_grade DESC`,
    },

    {
      title: "Courses Never Enrolled",
      description: "Find courses that no student has enrolled in.",
      difficulty: "medium" as const,
      question: `Find all courses that have no enrollments.\nReturn course name and instructor.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, instructor",
      solutionQuery: `SELECT c.name, c.instructor
FROM assignment_school.courses c
LEFT JOIN assignment_school.enrollments e ON c.id = e.course_id
WHERE e.id IS NULL`,
    },

    {
      title: "Top Student per Course",
      description: "Find the student with the highest grade in each course.",
      difficulty: "hard" as const,
      question: `For each course, find the student with the highest grade.\nReturn course name, student name, and grade.\nOrder by grade descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "students", "enrollments"],
      expectedColumns: "course_name, student_name, grade",
      solutionQuery: `SELECT DISTINCT ON (c.id)
  c.name AS course_name, s.name AS student_name, e.grade
FROM assignment_school.enrollments e
JOIN assignment_school.courses c ON e.course_id = c.id
JOIN assignment_school.students s ON e.student_id = s.id
ORDER BY c.id, e.grade DESC`,
    },

    {
      title: "Students in Fall 2023",
      description: "Filter enrollments by semester.",
      difficulty: "easy" as const,
      question: `Find all students enrolled in the 'Fall 2023' semester.\nReturn distinct student names and grade_level.\nOrder by name ascending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level",
      solutionQuery: `SELECT DISTINCT s.name, s.grade_level
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
WHERE e.semester = 'Fall 2023'
ORDER BY s.name ASC`,
    },

    {
      title: "Instructor with Most Students",
      description: "Find which instructor teaches the most enrolled students.",
      difficulty: "medium" as const,
      question: `Find the instructor who has the most total enrollments across all their courses.\nReturn instructor and total_enrollments.\nReturn only the top instructor.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "instructor, total_enrollments",
      solutionQuery: `SELECT c.instructor, COUNT(e.id) AS total_enrollments
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.instructor
ORDER BY total_enrollments DESC
LIMIT 1`,
    },

    {
      title: "Grade Distribution",
      description: "Count enrollments by grade range.",
      difficulty: "medium" as const,
      question: `Count enrollments by grade category: 'A' (>=3.7), 'B' (>=3.0), 'C' (<3.0).\nReturn grade_category and count.\nOrder by count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["enrollments"],
      expectedColumns: "grade_category, count",
      solutionQuery: `SELECT
  CASE
    WHEN grade >= 3.7 THEN 'A'
    WHEN grade >= 3.0 THEN 'B'
    ELSE 'C'
  END AS grade_category,
  COUNT(*) AS count
FROM assignment_school.enrollments
GROUP BY grade_category
ORDER BY count DESC`,
    },

    {
      title: "Students With Perfect GPA",
      description: "Find students who have a 4.0 in at least one course.",
      difficulty: "easy" as const,
      question: `Find all students who have received a perfect grade of 4.0 in any course.\nReturn student name and course name.\nOrder by student name.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "student_name, course_name",
      solutionQuery: `SELECT s.name AS student_name, c.name AS course_name
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
JOIN assignment_school.courses c ON e.course_id = c.id
WHERE e.grade = 4.0
ORDER BY s.name`,
    },

    {
      title: "Credits Enrolled per Student",
      description: "Sum course credits for each enrolled student.",
      difficulty: "medium" as const,
      question: `Calculate the total credits each student is enrolled in.\nReturn student name and total_credits.\nOrder by total_credits descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "name, total_credits",
      solutionQuery: `SELECT s.name, SUM(c.credits) AS total_credits
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
JOIN assignment_school.courses c ON e.course_id = c.id
GROUP BY s.id, s.name
ORDER BY total_credits DESC`,
    },

    {
      title: "Weighted GPA by Credits",
      description: "Calculate credit-weighted GPA for each student.",
      difficulty: "hard" as const,
      question: `Calculate the credit-weighted GPA for each student (sum of grade*credits / sum of credits).\nReturn student name and weighted_gpa (rounded to 2 decimal places).\nOrder by weighted_gpa descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "name, weighted_gpa",
      solutionQuery: `SELECT s.name,
  ROUND(SUM(e.grade * c.credits)::NUMERIC / SUM(c.credits), 2) AS weighted_gpa
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
JOIN assignment_school.courses c ON e.course_id = c.id
GROUP BY s.id, s.name
ORDER BY weighted_gpa DESC`,
    },

    {
      title: "Students Enrolled in Both Semesters",
      description: "Find students active in both Fall 2023 and Spring 2024.",
      difficulty: "hard" as const,
      question: `Find students who have enrollments in BOTH 'Fall 2023' and 'Spring 2024'.\nReturn student name and grade_level.\nOrder by name.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level",
      solutionQuery: `SELECT DISTINCT s.name, s.grade_level
FROM assignment_school.students s
WHERE EXISTS (
  SELECT 1 FROM assignment_school.enrollments e
  WHERE e.student_id = s.id AND e.semester = 'Fall 2023'
)
AND EXISTS (
  SELECT 1 FROM assignment_school.enrollments e
  WHERE e.student_id = s.id AND e.semester = 'Spring 2024'
)
ORDER BY s.name`,
    },

    {
      title: "Course with Highest Average Grade",
      description: "Find the single course with the best average student grade.",
      difficulty: "medium" as const,
      question: `Find the course with the highest average grade.\nReturn course name, instructor, and avg_grade (rounded to 2 decimals).`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, instructor, avg_grade",
      solutionQuery: `SELECT c.name, c.instructor, ROUND(AVG(e.grade), 2) AS avg_grade
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name, c.instructor
ORDER BY avg_grade DESC
LIMIT 1`,
    },

    {
      title: "Grade Rank Within Course",
      description: "Rank students by grade within each course.",
      difficulty: "hard" as const,
      question: `Rank each student by their grade within each course (highest = rank 1).\nReturn course name, student name, grade, and grade_rank.\nOrder by course name, then grade_rank.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "students", "enrollments"],
      expectedColumns: "course_name, student_name, grade, grade_rank",
      solutionQuery: `SELECT c.name AS course_name, s.name AS student_name, e.grade,
  RANK() OVER (PARTITION BY c.id ORDER BY e.grade DESC) AS grade_rank
FROM assignment_school.enrollments e
JOIN assignment_school.courses c ON e.course_id = c.id
JOIN assignment_school.students s ON e.student_id = s.id
ORDER BY c.name, grade_rank`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ADDITIONAL ECOMMERCE - ADVANCED (for NeetCode 150 padding)
    // ═══════════════════════════════════════════════════════════════════════════

    {
      title: "Median Order Value",
      description: "Calculate the median order value using PERCENTILE_CONT.",
      difficulty: "hard" as const,
      question: `Find the median total_amount across all orders.\nReturn a single column median_order_value.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "median_order_value",
      solutionQuery: `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_amount) AS median_order_value
FROM assignment_ecommerce.orders`,
    },

    {
      title: "Customer Cohort by Join Month",
      description: "Group customers into monthly cohorts and count them.",
      difficulty: "medium" as const,
      question: `Group customers by the month they joined and count how many joined per cohort.\nReturn cohort_month (formatted as YYYY-MM) and customer_count.\nOrder by cohort_month ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "cohort_month, customer_count",
      solutionQuery: `SELECT TO_CHAR(joined_at, 'YYYY-MM') AS cohort_month, COUNT(*) AS customer_count
FROM assignment_ecommerce.customers
GROUP BY cohort_month
ORDER BY cohort_month ASC`,
    },

    {
      title: "Products Not Ordered in March 2024",
      description: "Find products absent from a specific month's orders.",
      difficulty: "medium" as const,
      question: `Find all products that were NOT ordered during March 2024.\nReturn product name and category.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category",
      solutionQuery: `SELECT p.name, p.category
FROM assignment_ecommerce.products p
WHERE p.id NOT IN (
  SELECT DISTINCT product_id FROM assignment_ecommerce.orders
  WHERE ordered_at >= '2024-03-01' AND ordered_at < '2024-04-01'
)
ORDER BY p.name`,
    },

    {
      title: "Revenue Quartile Classification",
      description: "Classify each month by revenue quartile.",
      difficulty: "hard" as const,
      question: `For each month, calculate total revenue and classify it into quartiles.\nReturn year, month, total_revenue, and revenue_quartile (1 = lowest, 4 = highest).\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue, revenue_quartile",
      solutionQuery: `WITH monthly AS (
  SELECT EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS total_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
)
SELECT year, month, total_revenue,
  NTILE(4) OVER (ORDER BY total_revenue) AS revenue_quartile
FROM monthly
ORDER BY year, month`,
    },

    {
      title: "Customer Lifetime Value Segment",
      description: "Segment customers into LTV tiers using CASE and aggregation.",
      difficulty: "hard" as const,
      question: `Calculate total spend per customer and segment them: 'Gold' (>1500), 'Silver' (500-1500), 'Bronze' (<500).\nReturn name, total_spent, and segment.\nOrder by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, total_spent, segment",
      solutionQuery: `SELECT c.name,
  SUM(o.total_amount) AS total_spent,
  CASE
    WHEN SUM(o.total_amount) > 1500 THEN 'Gold'
    WHEN SUM(o.total_amount) >= 500 THEN 'Silver'
    ELSE 'Bronze'
  END AS segment
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC`,
    },

    {
      title: "Self Join: Compare Customer Orders",
      description: "Use a self-join on orders to find pairs of orders from the same customer.",
      difficulty: "hard" as const,
      question: `Find pairs of orders from the same customer where the later order is more than double the earlier order's amount.\nReturn customer name, first_order_amount, second_order_amount.\nOrder by second_order_amount descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, first_order_amount, second_order_amount",
      solutionQuery: `SELECT c.name, o1.total_amount AS first_order_amount, o2.total_amount AS second_order_amount
FROM assignment_ecommerce.orders o1
JOIN assignment_ecommerce.orders o2 ON o1.customer_id = o2.customer_id AND o2.ordered_at > o1.ordered_at
JOIN assignment_ecommerce.customers c ON o1.customer_id = c.id
WHERE o2.total_amount > o1.total_amount * 2
ORDER BY second_order_amount DESC`,
    },

    {
      title: "Dense Rank on Product Price",
      description: "Use DENSE_RANK to rank all products by price.",
      difficulty: "medium" as const,
      question: `Assign a dense rank to each product based on price (most expensive = rank 1).\nReturn name, price, and price_rank.\nOrder by price_rank.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, price, price_rank",
      solutionQuery: `SELECT name, price,
  DENSE_RANK() OVER (ORDER BY price DESC) AS price_rank
FROM assignment_ecommerce.products
ORDER BY price_rank`,
    },

    {
      title: "Lead and Lag Order Amounts",
      description: "Use LEAD and LAG to see the next and previous order amounts.",
      difficulty: "hard" as const,
      question: `For each order (ordered by ordered_at then id), show the previous and next order's total_amount.\nReturn id, total_amount, prev_amount, and next_amount.\nOrder by ordered_at, id.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, prev_amount, next_amount",
      solutionQuery: `SELECT id, total_amount,
  LAG(total_amount) OVER (ORDER BY ordered_at, id) AS prev_amount,
  LEAD(total_amount) OVER (ORDER BY ordered_at, id) AS next_amount
FROM assignment_ecommerce.orders
ORDER BY ordered_at, id`,
    },

    {
      title: "CTE: Top Products by Category",
      description: "Use a CTE to simplify a multi-step aggregation.",
      difficulty: "medium" as const,
      question: `Using a CTE, calculate total revenue per product then return only products whose revenue is above 200.\nReturn product name, category, and product_revenue.\nOrder by product_revenue descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, product_revenue",
      solutionQuery: `WITH product_rev AS (
  SELECT p.name, p.category, SUM(o.total_amount) AS product_revenue
  FROM assignment_ecommerce.products p
  JOIN assignment_ecommerce.orders o ON p.id = o.product_id
  GROUP BY p.id, p.name, p.category
)
SELECT name, category, product_revenue
FROM product_rev
WHERE product_revenue > 200
ORDER BY product_revenue DESC`,
    },

    {
      title: "EXISTS vs IN Performance Pattern",
      description: "Practice using EXISTS to find customers who have ordered Electronics.",
      difficulty: "medium" as const,
      question: `Find all customers who have ordered at least one Electronics product.\nUse EXISTS in your solution.\nReturn name and email.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders", "products"],
      expectedColumns: "name, email",
      solutionQuery: `SELECT c.name, c.email
FROM assignment_ecommerce.customers c
WHERE EXISTS (
  SELECT 1 FROM assignment_ecommerce.orders o
  JOIN assignment_ecommerce.products p ON o.product_id = p.id
  WHERE o.customer_id = c.id AND p.category = 'Electronics'
)
ORDER BY c.name`,
    },

    {
      title: "UNION: Customers and Products Named with A",
      description: "Practice UNION to combine results from two tables.",
      difficulty: "medium" as const,
      question: `Create a unified list of customers whose name starts with 'A' and products whose name starts with 'A'.\nReturn type ('customer' or 'product') and name.\nOrder by type, then name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "products"],
      expectedColumns: "type, name",
      solutionQuery: `SELECT 'customer' AS type, name FROM assignment_ecommerce.customers WHERE name LIKE 'A%'
UNION ALL
SELECT 'product' AS type, name FROM assignment_ecommerce.products WHERE name LIKE 'A%'
ORDER BY type, name`,
    },

    {
      title: "CROSS JOIN: All Customer-Product Combinations Count",
      description: "Use CROSS JOIN to understand the Cartesian product concept.",
      difficulty: "medium" as const,
      question: `How many total customer-product combinations exist?\nReturn a single value: total_combinations.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "products"],
      expectedColumns: "total_combinations",
      solutionQuery: `SELECT COUNT(*) AS total_combinations
FROM assignment_ecommerce.customers
CROSS JOIN assignment_ecommerce.products`,
    },

    {
      title: "Customers with Exactly 2 Orders",
      description: "Filter for an exact count using HAVING.",
      difficulty: "medium" as const,
      question: `Find all customers who have placed exactly 2 orders.\nReturn name, email, and order_count.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, order_count",
      solutionQuery: `SELECT c.name, c.email, COUNT(o.id) AS order_count
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(o.id) = 2
ORDER BY c.name`,
    },

    {
      title: "Products with Name Containing 'Pro'",
      description: "Use LIKE pattern matching.",
      difficulty: "easy" as const,
      question: `Find all products whose name contains the word 'Pro' (case-sensitive).\nReturn name, category, and price.\nOrder by price descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, category, price",
      solutionQuery: `SELECT name, category, price
FROM assignment_ecommerce.products
WHERE name LIKE '%Pro%'
ORDER BY price DESC`,
    },

    {
      title: "First Order of Each Customer",
      description: "Use MIN to find each customer's first order date.",
      difficulty: "easy" as const,
      question: `Find the date of each customer's first order.\nReturn customer name and first_order_date.\nOrder by first_order_date ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, first_order_date",
      solutionQuery: `SELECT c.name, MIN(o.ordered_at)::DATE AS first_order_date
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY first_order_date ASC`,
    },

    {
      title: "Product Price Standard Deviation",
      description: "Use STDDEV to analyze price variability.",
      difficulty: "hard" as const,
      question: `Calculate the standard deviation of product prices per category.\nReturn category and price_stddev (rounded to 2 decimal places).\nOrder by price_stddev descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "category, price_stddev",
      solutionQuery: `SELECT category, ROUND(STDDEV(price)::NUMERIC, 2) AS price_stddev
FROM assignment_ecommerce.products
GROUP BY category
ORDER BY price_stddev DESC`,
    },

    {
      title: "Total Quantity Sold Per Month",
      description: "Sum order quantities grouped by month.",
      difficulty: "medium" as const,
      question: `Calculate the total quantity of items sold each month.\nReturn year, month, and total_quantity.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_quantity",
      solutionQuery: `SELECT
  EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
  EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
  SUM(quantity) AS total_quantity
FROM assignment_ecommerce.orders
GROUP BY year, month
ORDER BY year, month`,
    },

    {
      title: "Customers Ranked by Order Count",
      description: "Use RANK to rank customers by how many orders they placed.",
      difficulty: "medium" as const,
      question: `Rank all customers by their total number of orders.\nReturn name, order_count, and order_rank.\nOrder by order_rank.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, order_count, order_rank",
      solutionQuery: `SELECT c.name, COUNT(o.id) AS order_count,
  RANK() OVER (ORDER BY COUNT(o.id) DESC) AS order_rank
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY order_rank`,
    },

    {
      title: "Furniture Products Total Stock",
      description: "Filter by category then aggregate stock.",
      difficulty: "easy" as const,
      question: `Calculate the total stock available for Furniture products.\nReturn a single value: total_furniture_stock.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "total_furniture_stock",
      solutionQuery: `SELECT SUM(stock) AS total_furniture_stock
FROM assignment_ecommerce.products
WHERE category = 'Furniture'`,
    },

    {
      title: "Recursive CTE: Employee Hierarchy",
      description: "Use a recursive CTE to traverse the employee reporting chain.",
      difficulty: "hard" as const,
      question: `Using a recursive CTE, find all employees who report (directly or indirectly) to 'Sarah Connor'.\nReturn employee name and their level in the hierarchy (1 = direct report).\nOrder by level, name.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, level",
      solutionQuery: `WITH RECURSIVE hierarchy AS (
  SELECT id, name, manager_id, 1 AS level
  FROM assignment_hr.employees
  WHERE manager_id = (SELECT id FROM assignment_hr.employees WHERE name = 'Sarah Connor')
  UNION ALL
  SELECT e.id, e.name, e.manager_id, h.level + 1
  FROM assignment_hr.employees e
  JOIN hierarchy h ON e.manager_id = h.id
)
SELECT name, level FROM hierarchy ORDER BY level, name`,
    },

    {
      title: "Department Salary Percentile",
      description: "Calculate where each employee's salary stands within all employees.",
      difficulty: "hard" as const,
      question: `For each employee, calculate their salary percentile rank among all employees.\nReturn name, salary, and salary_percentile (CUME_DIST rounded to 2 decimals).\nOrder by salary_percentile DESC.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, salary_percentile",
      solutionQuery: `SELECT name, salary,
  ROUND(CUME_DIST() OVER (ORDER BY salary)::NUMERIC, 2) AS salary_percentile
FROM assignment_hr.employees
ORDER BY salary_percentile DESC`,
    },

    {
      title: "Multiple Aggregates in One Query",
      description: "Combine MIN, MAX, AVG, SUM in a single GROUP BY query.",
      difficulty: "medium" as const,
      question: `For each department, show MIN, MAX, AVG (rounded to 2 decimals), and total salary.\nReturn department name, min_salary, max_salary, avg_salary, and total_salary.\nOrder by total_salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, min_salary, max_salary, avg_salary, total_salary",
      solutionQuery: `SELECT d.name AS department_name,
  MIN(e.salary) AS min_salary,
  MAX(e.salary) AS max_salary,
  ROUND(AVG(e.salary), 2) AS avg_salary,
  SUM(e.salary) AS total_salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY total_salary DESC`,
    },

    {
      title: "Students with Below Average GPA",
      description: "Use a subquery to compare each student's GPA to the overall average.",
      difficulty: "medium" as const,
      question: `Find students whose average grade is below the overall average grade across all enrollments.\nReturn student name, grade_level, and student_avg_grade (rounded to 2 decimals).\nOrder by student_avg_grade ascending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level, student_avg_grade",
      solutionQuery: `SELECT s.name, s.grade_level, ROUND(AVG(e.grade), 2) AS student_avg_grade
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name, s.grade_level
HAVING AVG(e.grade) < (SELECT AVG(grade) FROM assignment_school.enrollments)
ORDER BY student_avg_grade ASC`,
    },

    {
      title: "Instructor Revenue Equivalent",
      description: "Calculate total credits taught by each instructor.",
      difficulty: "medium" as const,
      question: `For each instructor, calculate the total number of credits they teach across all their courses.\nReturn instructor and total_credits.\nOrder by total_credits descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses"],
      expectedColumns: "instructor, total_credits",
      solutionQuery: `SELECT instructor, SUM(credits) AS total_credits
FROM assignment_school.courses
GROUP BY instructor
ORDER BY total_credits DESC`,
    },

    {
      title: "Enrollment Count by Grade Level",
      description: "Aggregate enrollments grouped by student grade level.",
      difficulty: "easy" as const,
      question: `Count the total number of enrollments for each student grade level.\nReturn grade_level and enrollment_count.\nOrder by grade_level ascending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "grade_level, enrollment_count",
      solutionQuery: `SELECT s.grade_level, COUNT(e.id) AS enrollment_count
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.grade_level
ORDER BY s.grade_level ASC`,
    },

    {
      title: "Students Not Enrolled in Any Course",
      description: "Use LEFT JOIN to find students with no enrollments.",
      difficulty: "medium" as const,
      question: `Find all students who are not enrolled in any course.\nReturn student name and grade_level.\nOrder by name.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level",
      solutionQuery: `SELECT s.name, s.grade_level
FROM assignment_school.students s
LEFT JOIN assignment_school.enrollments e ON s.id = e.student_id
WHERE e.id IS NULL
ORDER BY s.name`,
    },

    {
      title: "Running Average Grade per Student",
      description: "Calculate a running average of grades per student over time (by enrollment id).",
      difficulty: "hard" as const,
      question: `For each enrollment, calculate the running average grade for that student up to and including this enrollment.\nReturn student name, course name, grade, and running_avg (rounded to 2 decimals).\nOrder by student name, enrollment id.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "student_name, course_name, grade, running_avg",
      solutionQuery: `SELECT s.name AS student_name, c.name AS course_name, e.grade,
  ROUND(AVG(e.grade) OVER (PARTITION BY e.student_id ORDER BY e.id)::NUMERIC, 2) AS running_avg
FROM assignment_school.enrollments e
JOIN assignment_school.students s ON e.student_id = s.id
JOIN assignment_school.courses c ON e.course_id = c.id
ORDER BY s.name, e.id`,
    },

    {
      title: "Courses Taught by Prof. Dumbledore",
      description: "Simple WHERE filter on instructor name.",
      difficulty: "easy" as const,
      question: `Find all courses taught by Prof. Dumbledore.\nReturn course name and credits.\nOrder by credits descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses"],
      expectedColumns: "name, credits",
      solutionQuery: `SELECT name, credits
FROM assignment_school.courses
WHERE instructor = 'Prof. Dumbledore'
ORDER BY credits DESC`,
    },

    {
      title: "Average Order Value per Product Category (Filtered)",
      description: "Calculate average order total by product category with a HAVING filter.",
      difficulty: "medium" as const,
      question: `Calculate the average order total_amount per product category.\nOnly include categories where the average is above $100.\nReturn category and avg_order_value (rounded to 2 decimals).\nOrder by avg_order_value descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "products"],
      expectedColumns: "category, avg_order_value",
      solutionQuery: `SELECT p.category, ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.products p ON o.product_id = p.id
GROUP BY p.category
HAVING AVG(o.total_amount) > 100
ORDER BY avg_order_value DESC`,
    },

    {
      title: "Salary Moving Average",
      description: "Use window frames to compute a 3-employee moving average salary.",
      difficulty: "hard" as const,
      question: `Calculate a 3-row moving average of salaries when employees are ordered by salary.\nReturn employee name, salary, and moving_avg_salary (rounded to 2 decimals).\nOrder by salary.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, moving_avg_salary",
      solutionQuery: `SELECT name, salary,
  ROUND(AVG(salary) OVER (ORDER BY salary ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)::NUMERIC, 2) AS moving_avg_salary
FROM assignment_hr.employees
ORDER BY salary`,
    },

    {
      title: "First Value in Department",
      description: "Use FIRST_VALUE window function to find the highest salary in the dept for each row.",
      difficulty: "hard" as const,
      question: `For each employee, show the highest salary in their department using FIRST_VALUE.\nReturn employee name, department name, salary, and dept_highest_salary.\nOrder by department name, salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, salary, dept_highest_salary",
      solutionQuery: `SELECT e.name, d.name AS department_name, e.salary,
  FIRST_VALUE(e.salary) OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS dept_highest_salary
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
ORDER BY d.name, e.salary DESC`,
    },

    {
      title: "Customers with Orders in All Months",
      description: "Find customers who placed an order every month of 2024.",
      difficulty: "hard" as const,
      question: `Find customers who placed at least one order in every distinct month present in the orders table.\nReturn name and email.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email",
      solutionQuery: `WITH months_in_data AS (
  SELECT COUNT(DISTINCT DATE_TRUNC('month', ordered_at)) AS total_months FROM assignment_ecommerce.orders
),
customer_months AS (
  SELECT c.id, c.name, c.email,
    COUNT(DISTINCT DATE_TRUNC('month', o.ordered_at)) AS customer_months
  FROM assignment_ecommerce.customers c
  JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name, c.email
)
SELECT cm.name, cm.email
FROM customer_months cm, months_in_data m
WHERE cm.customer_months = m.total_months
ORDER BY cm.name`,
    },

    {
      title: "Product Price vs Category Average",
      description: "Compare each product's price to its category's average price.",
      difficulty: "hard" as const,
      question: `For each product, show whether its price is 'Above', 'Below', or 'At' the category average.\nReturn name, category, price, and price_vs_avg.\nOrder by category, price.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, category, price, price_vs_avg",
      solutionQuery: `SELECT name, category, price,
  CASE
    WHEN price > AVG(price) OVER (PARTITION BY category) THEN 'Above'
    WHEN price < AVG(price) OVER (PARTITION BY category) THEN 'Below'
    ELSE 'At'
  END AS price_vs_avg
FROM assignment_ecommerce.products
ORDER BY category, price`,
    },

    {
      title: "Duplicate Email Check",
      description: "Find email addresses that appear more than once in the customers table.",
      difficulty: "medium" as const,
      question: `Find any duplicate email addresses in the customers table.\nReturn email and count.\nOnly include emails that appear more than once.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "email, count",
      solutionQuery: `SELECT email, COUNT(*) AS count
FROM assignment_ecommerce.customers
GROUP BY email
HAVING COUNT(*) > 1`,
    },

    {
      title: "Rolling 3-Month Revenue",
      description: "Calculate a 3-month rolling revenue sum using window frames.",
      difficulty: "hard" as const,
      question: `For each month, calculate the rolling 3-month total revenue (current month plus the 2 preceding months).\nReturn year, month, monthly_revenue, and rolling_3_month_revenue.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, monthly_revenue, rolling_3_month_revenue",
      solutionQuery: `WITH monthly AS (
  SELECT EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS monthly_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
)
SELECT year, month, monthly_revenue,
  SUM(monthly_revenue) OVER (ORDER BY year, month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_3_month_revenue
FROM monthly
ORDER BY year, month`,
    },

    {
      title: "Employees with Salary Between 80k and 100k",
      description: "Use BETWEEN for range filtering.",
      difficulty: "easy" as const,
      question: `Find all employees with a salary between 80000 and 100000 (inclusive).\nReturn name, department_id, and salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary",
      solutionQuery: `SELECT e.name, e.salary
FROM assignment_hr.employees e
WHERE e.salary BETWEEN 80000 AND 100000
ORDER BY e.salary DESC`,
    },

    {
      title: "Employees Hired in Even Years",
      description: "Use modulo arithmetic on extracted year.",
      difficulty: "medium" as const,
      question: `Find all employees hired in an even-numbered year.\nReturn name, salary, and hire_date.\nOrder by hire_date.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, hire_date",
      solutionQuery: `SELECT name, salary, hire_date
FROM assignment_hr.employees
WHERE EXTRACT(YEAR FROM hire_date)::INTEGER % 2 = 0
ORDER BY hire_date`,
    },

    {
      title: "Department with Most Senior Employee",
      description: "Find which department has the employee with the earliest hire date.",
      difficulty: "medium" as const,
      question: `Find the department that contains the employee with the earliest hire_date overall.\nReturn department name and earliest_hire_date.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, earliest_hire_date",
      solutionQuery: `SELECT d.name AS department_name, e.hire_date AS earliest_hire_date
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
WHERE e.hire_date = (SELECT MIN(hire_date) FROM assignment_hr.employees)`,
    },

    {
      title: "Conditional Aggregation: Salary by Band and Department",
      description: "Use SUM with CASE inside GROUP BY.",
      difficulty: "hard" as const,
      question: `For each department, count how many employees fall into 'Junior' (<80k) and 'Senior' (>=100k) salary bands.\nReturn department name, junior_count, and senior_count.\nOrder by department name.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, junior_count, senior_count",
      solutionQuery: `SELECT d.name AS department_name,
  COUNT(CASE WHEN e.salary < 80000 THEN 1 END) AS junior_count,
  COUNT(CASE WHEN e.salary >= 100000 THEN 1 END) AS senior_count
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY d.name`,
    },

    {
      title: "Course Credits Distribution",
      description: "Count how many courses have each credit value.",
      difficulty: "easy" as const,
      question: `Count how many courses have each credit value.\nReturn credits and course_count.\nOrder by credits ascending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses"],
      expectedColumns: "credits, course_count",
      solutionQuery: `SELECT credits, COUNT(*) AS course_count
FROM assignment_school.courses
GROUP BY credits
ORDER BY credits ASC`,
    },

    {
      title: "Students Ordered by Enrollment Date",
      description: "Simple ORDER BY on date column.",
      difficulty: "easy" as const,
      question: `List all students ordered by their enrollment_date, from earliest to latest.\nReturn name, grade_level, and enrollment_date.`,
      sandboxSchema: "assignment_school",
      tables: ["students"],
      expectedColumns: "name, grade_level, enrollment_date",
      solutionQuery: `SELECT name, grade_level, enrollment_date
FROM assignment_school.students
ORDER BY enrollment_date ASC`,
    },

    {
      title: "Semester Enrollment Summary",
      description: "Count enrollments per semester.",
      difficulty: "easy" as const,
      question: `Count the number of enrollments per semester.\nReturn semester and enrollment_count.\nOrder by semester.`,
      sandboxSchema: "assignment_school",
      tables: ["enrollments"],
      expectedColumns: "semester, enrollment_count",
      solutionQuery: `SELECT semester, COUNT(*) AS enrollment_count
FROM assignment_school.enrollments
GROUP BY semester
ORDER BY semester`,
    },

    {
      title: "Top 3 Students by Weighted GPA",
      description: "Find the top 3 students by credit-weighted GPA.",
      difficulty: "hard" as const,
      question: `Using credit-weighted GPA, find the top 3 students.\nReturn name and weighted_gpa (rounded to 2 decimals).\nOrder by weighted_gpa descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "name, weighted_gpa",
      solutionQuery: `SELECT s.name,
  ROUND(SUM(e.grade * c.credits)::NUMERIC / SUM(c.credits), 2) AS weighted_gpa
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
JOIN assignment_school.courses c ON e.course_id = c.id
GROUP BY s.id, s.name
ORDER BY weighted_gpa DESC
LIMIT 3`,
    },

    {
      title: "Budget Remaining per Department",
      description: "Calculate remaining budget after subtracting total salaries.",
      difficulty: "medium" as const,
      question: `For each department, calculate the remaining budget (budget minus total salary).\nReturn department name, budget, total_salary, and remaining_budget.\nOrder by remaining_budget descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["departments", "employees"],
      expectedColumns: "department_name, budget, total_salary, remaining_budget",
      solutionQuery: `SELECT d.name AS department_name, d.budget,
  COALESCE(SUM(e.salary), 0) AS total_salary,
  d.budget - COALESCE(SUM(e.salary), 0) AS remaining_budget
FROM assignment_hr.departments d
LEFT JOIN assignment_hr.employees e ON d.id = e.department_id
GROUP BY d.id, d.name, d.budget
ORDER BY remaining_budget DESC`,
    },

    {
      title: "All Products with Their Order Count and Revenue",
      description: "Full product report including zero-order products.",
      difficulty: "medium" as const,
      question: `For ALL products (including those never ordered), show order_count and total_revenue.\nReturn name, category, order_count, and total_revenue (0 if none).\nOrder by total_revenue descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, order_count, total_revenue",
      solutionQuery: `SELECT p.name, p.category,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM assignment_ecommerce.products p
LEFT JOIN assignment_ecommerce.orders o ON p.id = o.product_id
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC`,
    },

    {
      title: "Compare Consecutive Monthly Revenues",
      description: "Use LAG to identify months where revenue decreased.",
      difficulty: "hard" as const,
      question: `Find months where total revenue was LOWER than the previous month.\nReturn year, month, total_revenue, and prev_revenue.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue, prev_revenue",
      solutionQuery: `WITH monthly AS (
  SELECT EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS total_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
),
with_lag AS (
  SELECT year, month, total_revenue,
    LAG(total_revenue) OVER (ORDER BY year, month) AS prev_revenue
  FROM monthly
)
SELECT year, month, total_revenue, prev_revenue
FROM with_lag
WHERE total_revenue < prev_revenue
ORDER BY year, month`,
    },

    {
      title: "Employees with Name Starting with S",
      description: "Use LIKE for pattern matching on names.",
      difficulty: "easy" as const,
      question: `Find all employees whose name starts with 'S'.\nReturn name, salary, and hire_date.\nOrder by name.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary, hire_date",
      solutionQuery: `SELECT name, salary, hire_date
FROM assignment_hr.employees
WHERE name LIKE 'S%'
ORDER BY name`,
    },

    {
      title: "Total Orders Value vs Average",
      description: "Show each order alongside the overall average.",
      difficulty: "medium" as const,
      question: `For each order, show its total_amount alongside the overall average order amount.\nReturn id, total_amount, and overall_avg (rounded to 2 decimals).\nOrder by total_amount descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, overall_avg",
      solutionQuery: `SELECT id, total_amount,
  ROUND(AVG(total_amount) OVER ()::NUMERIC, 2) AS overall_avg
FROM assignment_ecommerce.orders
ORDER BY total_amount DESC`,
    },

    {
      title: "Subquery: Products More Expensive Than All Books",
      description: "Use ALL in a subquery to compare across categories.",
      difficulty: "hard" as const,
      question: `Find all non-Book products that are more expensive than ALL Books products.\nReturn name, category, and price.\nOrder by price descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, category, price",
      solutionQuery: `SELECT name, category, price
FROM assignment_ecommerce.products
WHERE category != 'Books'
AND price > ALL (SELECT price FROM assignment_ecommerce.products WHERE category = 'Books')
ORDER BY price DESC`,
    },

    {
      title: "Employee Count vs Budget Ratio",
      description: "Calculate budget per employee for each department.",
      difficulty: "medium" as const,
      question: `For each department, calculate the budget per employee.\nReturn department name, employee_count, budget, and budget_per_employee (rounded to 2 decimals).\nOrder by budget_per_employee descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["departments", "employees"],
      expectedColumns: "department_name, employee_count, budget, budget_per_employee",
      solutionQuery: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count, d.budget,
  ROUND(d.budget / COUNT(e.id), 2) AS budget_per_employee
FROM assignment_hr.departments d
JOIN assignment_hr.employees e ON d.id = e.department_id
GROUP BY d.id, d.name, d.budget
ORDER BY budget_per_employee DESC`,
    },

    {
      title: "Courses with More Than 3 Enrollments",
      description: "Filter courses with high enrollment using HAVING.",
      difficulty: "easy" as const,
      question: `Find courses with more than 3 enrollments.\nReturn course name, instructor, and enrollment_count.\nOrder by enrollment_count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, instructor, enrollment_count",
      solutionQuery: `SELECT c.name, c.instructor, COUNT(e.id) AS enrollment_count
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name, c.instructor
HAVING COUNT(e.id) > 3
ORDER BY enrollment_count DESC`,
    },

    {
      title: "Highest Grade per Student",
      description: "Find the maximum grade each student has received.",
      difficulty: "easy" as const,
      question: `Find the highest grade received by each student.\nReturn student name and best_grade.\nOrder by best_grade descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, best_grade",
      solutionQuery: `SELECT s.name, MAX(e.grade) AS best_grade
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name
ORDER BY best_grade DESC`,
    },

    {
      title: "Employees with AT LEAST One Report in Engineering",
      description: "Use a JOIN with EXISTS to find managers with engineering reports.",
      difficulty: "hard" as const,
      question: `Find managers who have at least one direct report in the Engineering department.\nReturn manager name and salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, salary",
      solutionQuery: `SELECT DISTINCT m.name, m.salary
FROM assignment_hr.employees m
WHERE EXISTS (
  SELECT 1 FROM assignment_hr.employees e
  JOIN assignment_hr.departments d ON e.department_id = d.id
  WHERE e.manager_id = m.id AND d.name = 'Engineering'
)
ORDER BY m.salary DESC`,
    },

    {
      title: "Customers by City Count",
      description: "Count customers per city.",
      difficulty: "easy" as const,
      question: `Count the number of customers in each city.\nReturn city and customer_count.\nOrder by customer_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "city, customer_count",
      solutionQuery: `SELECT city, COUNT(*) AS customer_count
FROM assignment_ecommerce.customers
GROUP BY city
ORDER BY customer_count DESC`,
    },

    {
      title: "INNER JOIN vs LEFT JOIN Results",
      description: "Understand the difference by querying all customers and their order counts including zeros.",
      difficulty: "medium" as const,
      question: `List all customers (even those with no orders) with their order count.\nReturn customer name and order_count (0 for those with no orders).\nOrder by order_count DESC, name ASC.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, order_count",
      solutionQuery: `SELECT c.name, COUNT(o.id) AS order_count
FROM assignment_ecommerce.customers c
LEFT JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY order_count DESC, c.name ASC`,
    },

    {
      title: "HAVING vs WHERE Distinction",
      description: "Demonstrate that HAVING filters on aggregated results.",
      difficulty: "medium" as const,
      question: `Find product categories where the number of distinct products is greater than 3.\nReturn category and product_count.\nOrder by product_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "category, product_count",
      solutionQuery: `SELECT category, COUNT(*) AS product_count
FROM assignment_ecommerce.products
GROUP BY category
HAVING COUNT(*) > 3
ORDER BY product_count DESC`,
    },

    {
      title: "Window Frame: Last 3 Orders Revenue",
      description: "Sum revenue over the last 3 orders using ROWS frame.",
      difficulty: "hard" as const,
      question: `For each order, calculate the sum of the current and previous 2 orders by amount (ordered by ordered_at, id).\nReturn id, total_amount, and last_3_sum.\nOrder by ordered_at, id.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, last_3_sum",
      solutionQuery: `SELECT id, total_amount,
  SUM(total_amount) OVER (ORDER BY ordered_at, id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last_3_sum
FROM assignment_ecommerce.orders
ORDER BY ordered_at, id`,
    },

    {
      title: "Group by Hire Year and Department",
      description: "Multi-column GROUP BY combining date extraction and foreign key.",
      difficulty: "medium" as const,
      question: `Count employees hired each year grouped by department.\nReturn department name, hire_year, and employee_count.\nOrder by department name, hire_year.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, hire_year, employee_count",
      solutionQuery: `SELECT d.name AS department_name,
  EXTRACT(YEAR FROM e.hire_date)::INTEGER AS hire_year,
  COUNT(*) AS employee_count
FROM assignment_hr.employees e
JOIN assignment_hr.departments d ON e.department_id = d.id
GROUP BY d.id, d.name, hire_year
ORDER BY d.name, hire_year`,
    },

    {
      title: "Max Salary per Hire Year",
      description: "Find the highest salary earned by someone hired each year.",
      difficulty: "medium" as const,
      question: `For each hire year, find the maximum salary among employees hired that year.\nReturn hire_year and max_salary.\nOrder by hire_year.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "hire_year, max_salary",
      solutionQuery: `SELECT EXTRACT(YEAR FROM hire_date)::INTEGER AS hire_year, MAX(salary) AS max_salary
FROM assignment_hr.employees
GROUP BY hire_year
ORDER BY hire_year`,
    },

    {
      title: "CTE: Department Summary with Rank",
      description: "Use a CTE to produce a department summary and then rank them.",
      difficulty: "hard" as const,
      question: `Using a CTE, calculate total salary and employee count per department, then rank departments by total salary.\nReturn department name, total_salary, employee_count, and salary_rank.\nOrder by salary_rank.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, total_salary, employee_count, salary_rank",
      solutionQuery: `WITH dept_summary AS (
  SELECT d.name AS department_name,
    SUM(e.salary) AS total_salary,
    COUNT(e.id) AS employee_count
  FROM assignment_hr.departments d
  JOIN assignment_hr.employees e ON d.id = e.department_id
  GROUP BY d.id, d.name
)
SELECT department_name, total_salary, employee_count,
  RANK() OVER (ORDER BY total_salary DESC) AS salary_rank
FROM dept_summary
ORDER BY salary_rank`,
    },

    {
      title: "All Order Details with Lookup Columns",
      description: "Full three-table join for a complete order detail line.",
      difficulty: "medium" as const,
      question: `Return every order with customer city, product category, quantity, and total_amount.\nOrder by ordered_at DESC, customer city ASC.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "customers", "products"],
      expectedColumns: "city, category, quantity, total_amount, ordered_at",
      solutionQuery: `SELECT c.city, p.category, o.quantity, o.total_amount, o.ordered_at
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.customers c ON o.customer_id = c.id
JOIN assignment_ecommerce.products p ON o.product_id = p.id
ORDER BY o.ordered_at DESC, c.city ASC`,
    },

    {
      title: "Top Instructor by Average Student GPA",
      description: "Join courses and enrollments and group by instructor.",
      difficulty: "hard" as const,
      question: `Find the instructor whose students have the highest average grade across all courses they teach.\nReturn instructor and avg_student_grade (rounded to 2 decimals).`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "instructor, avg_student_grade",
      solutionQuery: `SELECT c.instructor, ROUND(AVG(e.grade), 2) AS avg_student_grade
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.instructor
ORDER BY avg_student_grade DESC
LIMIT 1`,
    },

    {
      title: "Employees in Multiple Departments Check",
      description: "Verify that all employees belong to exactly one department.",
      difficulty: "medium" as const,
      question: `Count how many distinct department_id values each employee is associated with.\nReturn name and dept_count.\nOnly include rows where dept_count > 1 (ideally should be 0 rows in clean data).`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, dept_count",
      solutionQuery: `SELECT name, COUNT(DISTINCT department_id) AS dept_count
FROM assignment_hr.employees
GROUP BY id, name
HAVING COUNT(DISTINCT department_id) > 1`,
    },

    {
      title: "Monthly New Customer Cumulative Total",
      description: "Use a running SUM of new customers each month.",
      difficulty: "hard" as const,
      question: `Calculate the cumulative total of customers joined up to and including each month.\nReturn cohort_month and cumulative_customers.\nOrder by cohort_month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers"],
      expectedColumns: "cohort_month, cumulative_customers",
      solutionQuery: `WITH monthly AS (
  SELECT TO_CHAR(joined_at, 'YYYY-MM') AS cohort_month, COUNT(*) AS new_customers
  FROM assignment_ecommerce.customers
  GROUP BY cohort_month
)
SELECT cohort_month,
  SUM(new_customers) OVER (ORDER BY cohort_month) AS cumulative_customers
FROM monthly
ORDER BY cohort_month`,
    },

    {
      title: "Assign Category Budget Rank",
      description: "Rank departments by their budget using RANK().",
      difficulty: "medium" as const,
      question: `Rank all departments by budget (highest = 1).\nReturn department name, budget, and budget_rank.\nOrder by budget_rank.`,
      sandboxSchema: "assignment_hr",
      tables: ["departments"],
      expectedColumns: "name, budget, budget_rank",
      solutionQuery: `SELECT name, budget,
  RANK() OVER (ORDER BY budget DESC) AS budget_rank
FROM assignment_hr.departments
ORDER BY budget_rank`,
    },

    {
      title: "Customer Order Gap Analysis",
      description: "Find the maximum gap between consecutive orders for each customer.",
      difficulty: "hard" as const,
      question: `For each customer with more than 1 order, find the maximum number of days between any two consecutive orders.\nReturn customer name and max_gap_days.\nOrder by max_gap_days descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, max_gap_days",
      solutionQuery: `WITH ordered AS (
  SELECT c.id, c.name, o.ordered_at,
    LAG(o.ordered_at) OVER (PARTITION BY c.id ORDER BY o.ordered_at) AS prev_order
  FROM assignment_ecommerce.customers c
  JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
),
gaps AS (
  SELECT id, name, EXTRACT(EPOCH FROM (ordered_at - prev_order))/86400 AS gap_days
  FROM ordered WHERE prev_order IS NOT NULL
)
SELECT name, MAX(gap_days)::INTEGER AS max_gap_days
FROM gaps
GROUP BY id, name
ORDER BY max_gap_days DESC`,
    },

    {
      title: "Grade Improvement Across Semesters",
      description: "Use LAG to detect if a student improved grade in their next enrollment.",
      difficulty: "hard" as const,
      question: `For each student's enrollments ordered by enrollment id, find cases where their grade is higher than in their previous enrollment.\nReturn student name, course name, grade, prev_grade.\nOrder by student name, enrollment id.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "student_name, course_name, grade, prev_grade",
      solutionQuery: `WITH graded AS (
  SELECT s.name AS student_name, c.name AS course_name, e.grade, e.id,
    LAG(e.grade) OVER (PARTITION BY e.student_id ORDER BY e.id) AS prev_grade
  FROM assignment_school.enrollments e
  JOIN assignment_school.students s ON e.student_id = s.id
  JOIN assignment_school.courses c ON e.course_id = c.id
)
SELECT student_name, course_name, grade, prev_grade
FROM graded
WHERE prev_grade IS NOT NULL AND grade > prev_grade
ORDER BY student_name, id`,
    },

    {
      title: "Products in Stock vs Out of Stock",
      description: "Count products that are in stock (stock > 0) vs out of stock.",
      difficulty: "easy" as const,
      question: `Count how many products are 'In Stock' (stock > 0) and how many are 'Out of Stock' (stock = 0).\nReturn stock_status and product_count.\nOrder by product_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "stock_status, product_count",
      solutionQuery: `SELECT
  CASE WHEN stock > 0 THEN 'In Stock' ELSE 'Out of Stock' END AS stock_status,
  COUNT(*) AS product_count
FROM assignment_ecommerce.products
GROUP BY stock_status
ORDER BY product_count DESC`,
    },

    {
      title: "Multi-CTE Pipeline: Revenue and Growth",
      description: "Chain multiple CTEs to calculate monthly revenue and growth flag.",
      difficulty: "hard" as const,
      question: `Using multiple CTEs: (1) calculate monthly revenue, (2) add previous month's revenue using LAG, (3) filter to only months where revenue grew.\nReturn year, month, total_revenue, prev_revenue.\nOrder by year, month.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue, prev_revenue",
      solutionQuery: `WITH monthly AS (
  SELECT EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
    EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
    SUM(total_amount) AS total_revenue
  FROM assignment_ecommerce.orders
  GROUP BY year, month
),
with_prev AS (
  SELECT year, month, total_revenue,
    LAG(total_revenue) OVER (ORDER BY year, month) AS prev_revenue
  FROM monthly
)
SELECT year, month, total_revenue, prev_revenue
FROM with_prev
WHERE prev_revenue IS NOT NULL AND total_revenue > prev_revenue
ORDER BY year, month`,
    },

    {
      title: "Instructor Course Count",
      description: "Count how many courses each instructor teaches.",
      difficulty: "easy" as const,
      question: `Count the number of courses each instructor teaches.\nReturn instructor and course_count.\nOrder by course_count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses"],
      expectedColumns: "instructor, course_count",
      solutionQuery: `SELECT instructor, COUNT(*) AS course_count
FROM assignment_school.courses
GROUP BY instructor
ORDER BY course_count DESC`,
    },

    {
      title: "FULL OUTER JOIN Products and Orders",
      description: "Use FULL OUTER JOIN to see all products and all orders.",
      difficulty: "hard" as const,
      question: `Using a FULL OUTER JOIN between products and orders, count how many orders each product has — and also show any orders that somehow have no matching product.\nReturn product name (or 'Unknown'), order_id (or NULL), and total_amount.\nOrder by product name NULLS LAST.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "product_name, order_id, total_amount",
      solutionQuery: `SELECT COALESCE(p.name, 'Unknown') AS product_name, o.id AS order_id, o.total_amount
FROM assignment_ecommerce.products p
FULL OUTER JOIN assignment_ecommerce.orders o ON p.id = o.product_id
ORDER BY p.name NULLS LAST`,
    },

    {
      title: "Employees Hired on Same Day",
      description: "Self-join to find employees who share a hire date.",
      difficulty: "hard" as const,
      question: `Find pairs of employees who were hired on the same date (different employees).\nReturn employee1_name, employee2_name, and hire_date.\nAvoid duplicate pairs (a,b) and (b,a) by using e1.id < e2.id.\nOrder by hire_date.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "employee1_name, employee2_name, hire_date",
      solutionQuery: `SELECT e1.name AS employee1_name, e2.name AS employee2_name, e1.hire_date
FROM assignment_hr.employees e1
JOIN assignment_hr.employees e2 ON e1.hire_date = e2.hire_date AND e1.id < e2.id
ORDER BY e1.hire_date`,
    },

    {
      title: "Department Name Uppercase",
      description: "Use string function UPPER() on a column.",
      difficulty: "easy" as const,
      question: `Return all department names in uppercase along with their budget.\nReturn upper_name and budget.\nOrder by budget descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["departments"],
      expectedColumns: "upper_name, budget",
      solutionQuery: `SELECT UPPER(name) AS upper_name, budget
FROM assignment_hr.departments
ORDER BY budget DESC`,
    },

    {
      title: "Orders in Top 10% by Amount",
      description: "Use PERCENT_RANK or NTILE to find top 10% orders.",
      difficulty: "hard" as const,
      question: `Find all orders in the top 10% by total_amount.\nReturn id, total_amount, and amount_percentile (PERCENT_RANK rounded to 2 decimals).\nOrder by total_amount descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, total_amount, amount_percentile",
      solutionQuery: `WITH ranked AS (
  SELECT id, total_amount,
    ROUND(PERCENT_RANK() OVER (ORDER BY total_amount)::NUMERIC, 2) AS amount_percentile
  FROM assignment_ecommerce.orders
)
SELECT id, total_amount, amount_percentile
FROM ranked
WHERE amount_percentile >= 0.9
ORDER BY total_amount DESC`,
    },

    {
      title: "Students and Their Course Count",
      description: "Left join to include students with zero courses.",
      difficulty: "easy" as const,
      question: `List all students and how many courses they are enrolled in (0 if none).\nReturn name and course_count.\nOrder by course_count DESC, name ASC.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, course_count",
      solutionQuery: `SELECT s.name, COUNT(e.id) AS course_count
FROM assignment_school.students s
LEFT JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name
ORDER BY course_count DESC, s.name ASC`,
    },

    {
      title: "EXCEPT: Products Ordered in Jan but not Feb",
      description: "Use EXCEPT to find products ordered in January but not February 2024.",
      difficulty: "hard" as const,
      question: `Find product IDs that were ordered in January 2024 but NOT in February 2024.\nReturn product name.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name",
      solutionQuery: `SELECT p.name
FROM assignment_ecommerce.products p
WHERE p.id IN (
  SELECT DISTINCT product_id FROM assignment_ecommerce.orders
  WHERE ordered_at >= '2024-01-01' AND ordered_at < '2024-02-01'
)
EXCEPT
SELECT p.name
FROM assignment_ecommerce.products p
WHERE p.id IN (
  SELECT DISTINCT product_id FROM assignment_ecommerce.orders
  WHERE ordered_at >= '2024-02-01' AND ordered_at < '2024-03-01'
)
ORDER BY name`,
    },

    {
      title: "Salary Lag: Compare to Previous Hire",
      description: "Use LAG to see each employee's salary vs the previously hired employee.",
      difficulty: "hard" as const,
      question: `For each employee (ordered by hire_date), show their salary and the salary of the employee hired just before them.\nReturn name, hire_date, salary, and prev_hire_salary.\nOrder by hire_date.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, hire_date, salary, prev_hire_salary",
      solutionQuery: `SELECT name, hire_date, salary,
  LAG(salary) OVER (ORDER BY hire_date) AS prev_hire_salary
FROM assignment_hr.employees
ORDER BY hire_date`,
    },

    {
      title: "Employees with Salary in Top 3 Overall",
      description: "Use DENSE_RANK to find employees with the top 3 salary values.",
      difficulty: "hard" as const,
      question: `Find all employees whose salary is among the top 3 distinct salary values overall.\nReturn name, department name, and salary.\nOrder by salary DESC.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "name, department_name, salary",
      solutionQuery: `WITH ranked AS (
  SELECT e.name, d.name AS department_name, e.salary,
    DENSE_RANK() OVER (ORDER BY e.salary DESC) AS rnk
  FROM assignment_hr.employees e
  JOIN assignment_hr.departments d ON e.department_id = d.id
)
SELECT name, department_name, salary FROM ranked WHERE rnk <= 3
ORDER BY salary DESC`,
    },

    {
      title: "Revenue Comparison: Electronics vs Furniture",
      description: "Use conditional aggregation to compare two category revenues side by side.",
      difficulty: "hard" as const,
      question: `In a single query, show total revenue for Electronics and total revenue for Furniture.\nReturn electronics_revenue and furniture_revenue.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "products"],
      expectedColumns: "electronics_revenue, furniture_revenue",
      solutionQuery: `SELECT
  SUM(CASE WHEN p.category = 'Electronics' THEN o.total_amount ELSE 0 END) AS electronics_revenue,
  SUM(CASE WHEN p.category = 'Furniture' THEN o.total_amount ELSE 0 END) AS furniture_revenue
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.products p ON o.product_id = p.id`,
    },

    {
      title: "Courses with GPA Range",
      description: "Show min, max, and range of grades per course.",
      difficulty: "medium" as const,
      question: `For each course, show the min grade, max grade, and grade range (max - min).\nReturn course name, min_grade, max_grade, and grade_range.\nOrder by grade_range descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, min_grade, max_grade, grade_range",
      solutionQuery: `SELECT c.name, MIN(e.grade) AS min_grade, MAX(e.grade) AS max_grade,
  MAX(e.grade) - MIN(e.grade) AS grade_range
FROM assignment_school.courses c
JOIN assignment_school.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name
ORDER BY grade_range DESC`,
    },

    {
      title: "Employees with Common Last Name",
      description: "Extract last name and find duplicates.",
      difficulty: "hard" as const,
      question: `Find last names shared by more than one employee.\nExtract the last name as everything after the last space in name.\nReturn last_name and employee_count.\nOrder by employee_count DESC.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "last_name, employee_count",
      solutionQuery: `SELECT SPLIT_PART(name, ' ', 2) AS last_name, COUNT(*) AS employee_count
FROM assignment_hr.employees
GROUP BY last_name
HAVING COUNT(*) > 1
ORDER BY employee_count DESC`,
    },

    {
      title: "Order Distribution by Weekday",
      description: "Group orders by day of week.",
      difficulty: "medium" as const,
      question: `Count the number of orders placed on each day of the week.\nReturn day_of_week (e.g. 'Monday') and order_count.\nOrder by order_count descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "day_of_week, order_count",
      solutionQuery: `SELECT TO_CHAR(ordered_at, 'Day') AS day_of_week, COUNT(*) AS order_count
FROM assignment_ecommerce.orders
GROUP BY day_of_week
ORDER BY order_count DESC`,
    },

    {
      title: "Number of Unique Products Ordered per Customer",
      description: "Count distinct products each customer has ordered.",
      difficulty: "medium" as const,
      question: `For each customer, count how many distinct products they have ordered.\nReturn name and unique_products.\nOrder by unique_products descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, unique_products",
      solutionQuery: `SELECT c.name, COUNT(DISTINCT o.product_id) AS unique_products
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY unique_products DESC`,
    },

    {
      title: "Above-Median Salary Employees",
      description: "Filter employees with salary above the median using PERCENTILE_CONT.",
      difficulty: "hard" as const,
      question: `Find all employees whose salary is above the median salary.\nReturn name and salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "name, salary",
      solutionQuery: `SELECT name, salary
FROM assignment_hr.employees
WHERE salary > (
  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)
  FROM assignment_hr.employees
)
ORDER BY salary DESC`,
    },

    {
      title: "Customer Spend Rank with Dense Rank",
      description: "Apply DENSE_RANK to customer spending to handle ties.",
      difficulty: "medium" as const,
      question: `Rank all customers by total spending using DENSE_RANK (ties get the same rank).\nReturn name, total_spent, and spend_rank.\nOrder by spend_rank.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, total_spent, spend_rank",
      solutionQuery: `SELECT c.name,
  SUM(o.total_amount) AS total_spent,
  DENSE_RANK() OVER (ORDER BY SUM(o.total_amount) DESC) AS spend_rank
FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY spend_rank`,
    },

    {
      title: "Category Revenue Share with ROLLUP",
      description: "Use ROLLUP to produce subtotals and grand total.",
      difficulty: "hard" as const,
      question: `Calculate revenue per product category and include a grand total row using ROLLUP.\nReturn category (NULL for grand total) and total_revenue.\nOrder by total_revenue DESC NULLS LAST.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "products"],
      expectedColumns: "category, total_revenue",
      solutionQuery: `SELECT p.category, SUM(o.total_amount) AS total_revenue
FROM assignment_ecommerce.orders o
JOIN assignment_ecommerce.products p ON o.product_id = p.id
GROUP BY ROLLUP(p.category)
ORDER BY total_revenue DESC NULLS LAST`,
    },

    {
      title: "Student Rank by GPA in Grade Level",
      description: "Rank students by GPA within their grade level.",
      difficulty: "hard" as const,
      question: `Rank students by average grade within their grade_level group.\nReturn name, grade_level, avg_grade (rounded to 2 decimals), and grade_rank.\nOrder by grade_level, grade_rank.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level, avg_grade, grade_rank",
      solutionQuery: `SELECT s.name, s.grade_level,
  ROUND(AVG(e.grade), 2) AS avg_grade,
  RANK() OVER (PARTITION BY s.grade_level ORDER BY AVG(e.grade) DESC) AS grade_rank
FROM assignment_school.students s
JOIN assignment_school.enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name, s.grade_level
ORDER BY s.grade_level, grade_rank`,
    },

    {
      title: "Total Budget vs Total Salary Company Wide",
      description: "Aggregate across all departments to compare company totals.",
      difficulty: "medium" as const,
      question: `Calculate the total company budget and total salary cost.\nReturn total_budget, total_salary, and surplus (budget minus salary).`,
      sandboxSchema: "assignment_hr",
      tables: ["departments", "employees"],
      expectedColumns: "total_budget, total_salary, surplus",
      solutionQuery: `SELECT SUM(DISTINCT d.budget) AS total_budget,
  SUM(e.salary) AS total_salary,
  SUM(DISTINCT d.budget) - SUM(e.salary) AS surplus
FROM assignment_hr.departments d
LEFT JOIN assignment_hr.employees e ON d.id = e.department_id`,
    },

    {
      title: "Product Name Length",
      description: "Use LENGTH() string function to analyze product names.",
      difficulty: "easy" as const,
      question: `Find the product with the longest name.\nReturn name and name_length.\nIf tied, return all tied products.\nOrder by name_length DESC.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products"],
      expectedColumns: "name, name_length",
      solutionQuery: `SELECT name, LENGTH(name) AS name_length
FROM assignment_ecommerce.products
WHERE LENGTH(name) = (SELECT MAX(LENGTH(name)) FROM assignment_ecommerce.products)
ORDER BY name_length DESC`,
    },

    {
      title: "Enrollment with Letter Grade",
      description: "Use CASE to map numeric grade to letter grade.",
      difficulty: "easy" as const,
      question: `For every enrollment, show the student name, course name, numeric grade, and letter_grade (A:>=3.7, B:>=3.0, C:<3.0).\nOrder by student name, then letter_grade.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "courses", "enrollments"],
      expectedColumns: "student_name, course_name, grade, letter_grade",
      solutionQuery: `SELECT s.name AS student_name, c.name AS course_name, e.grade,
  CASE WHEN e.grade >= 3.7 THEN 'A' WHEN e.grade >= 3.0 THEN 'B' ELSE 'C' END AS letter_grade
FROM assignment_school.enrollments e
JOIN assignment_school.students s ON e.student_id = s.id
JOIN assignment_school.courses c ON e.course_id = c.id
ORDER BY s.name, letter_grade`,
    },

    {
      title: "INTERSECT: Customers Who Ordered in Both Jan and Apr 2024",
      description: "Use INTERSECT to find customers active in both months.",
      difficulty: "hard" as const,
      question: `Find customers who placed orders in BOTH January 2024 AND April 2024.\nReturn customer name.\nOrder by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name",
      solutionQuery: `SELECT c.name FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
WHERE o.ordered_at >= '2024-01-01' AND o.ordered_at < '2024-02-01'
INTERSECT
SELECT c.name FROM assignment_ecommerce.customers c
JOIN assignment_ecommerce.orders o ON c.id = o.customer_id
WHERE o.ordered_at >= '2024-04-01' AND o.ordered_at < '2024-05-01'
ORDER BY name`,
    },

    {
      title: "Employee with Maximum Salary in Each Hire Year",
      description: "Find the top earner hired each year.",
      difficulty: "hard" as const,
      question: `For each hire year, find the employee with the highest salary.\nReturn hire_year, employee name, and salary.\nOrder by hire_year.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees"],
      expectedColumns: "hire_year, name, salary",
      solutionQuery: `SELECT DISTINCT ON (EXTRACT(YEAR FROM hire_date))
  EXTRACT(YEAR FROM hire_date)::INTEGER AS hire_year, name, salary
FROM assignment_hr.employees
ORDER BY EXTRACT(YEAR FROM hire_date), salary DESC`,
    },

    {
      title: "Student Grade Percentile",
      description: "Use PERCENT_RANK to see where each student's average grade stands.",
      difficulty: "hard" as const,
      question: `Calculate each student's average grade and their percentile rank among all students.\nReturn name, avg_grade (rounded to 2 decimals), and grade_percentile (rounded to 2 decimals).\nOrder by grade_percentile DESC.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, avg_grade, grade_percentile",
      solutionQuery: `WITH student_gpa AS (
  SELECT s.name, ROUND(AVG(e.grade), 2) AS avg_grade
  FROM assignment_school.students s
  JOIN assignment_school.enrollments e ON s.id = e.student_id
  GROUP BY s.id, s.name
)
SELECT name, avg_grade,
  ROUND(PERCENT_RANK() OVER (ORDER BY avg_grade)::NUMERIC, 2) AS grade_percentile
FROM student_gpa
ORDER BY grade_percentile DESC`,
    },

  ]; // end return array
}

// ─── Seed Assignments ─────────────────────────────────────────────────────────

async function seedAssignments(cats: typeof categories.$inferSelect[]) {
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  const allAssignments = getAllAssignments();

  // Insert in batches of 20 to avoid parameter limits
  const BATCH = 20;
  const insertedRows: typeof assignments.$inferSelect[] = [];
  for (let i = 0; i < allAssignments.length; i += BATCH) {
    const batch = allAssignments.slice(i, i + BATCH);
    const rows = await db.insert(assignments).values(batch).returning();
    insertedRows.push(...rows);
  }
  console.log(`✅ Assignments seeded: ${insertedRows.length}`);

  const byTitle = Object.fromEntries(insertedRows.map((r) => [r.title, r.id]));

  // ── Category Mappings ──────────────────────────────────────────────────────
  //
  // NeetCode 150 — 150 questions (every single question we inserted)
  // Top 50 Interview — first 50 questions from this curated list
  // Other categories — subset groupings

  const neetcode150Titles: string[] = [
    // Ecommerce basics
    "Top Customers by Spending",
    "Products Never Ordered",
    "Monthly Revenue Report",
    "Revenue by Product Category",
    "Customers with Multiple Orders",
    "Running Total Order Revenue",
    "Most Expensive Product Per Category",
    "Customer Order Summary",
    "Products with Low Stock",
    "Orders Above Average Amount",
    "Customers Who Never Ordered",
    "Average Order Value by Customer City",
    "Top Selling Products by Quantity",
    "Order Rank by Amount",
    "Customers Joined in Q1 2023",
    "Daily Order Count",
    "Products Ordered More Than Once",
    "Customer with Highest Single Order",
    "Product Revenue Contribution Percentage",
    "Electronics Products Above 100",
    "Customers from New York with Orders",
    "Nth Highest Order Amount",
    "Month-over-Month Revenue Growth",
    "Customer First and Last Order",
    "Orders in January 2024",
    "Products with Above-Average Price",
    "Number of Products per Category",
    "Total Stock Value by Category",
    "Order Count per Product",
    "Customers Ordered Both Electronics and Books",
    "Latest Order per Customer",
    "Cumulative Revenue by Customer",
    "Products Ordered in February 2024",
    "Customer Spending Percentile",
    "Average Days Between Orders",
    "Top Product per Category",
    "Orders with Product and Customer Details",
    "Revenue Growth Rate by Month",
    "Count Distinct Customers per Month",
    "Price Buckets",
    "Customers Who Spent Over 500",
    "Product Sales Rank",
    "New Customers Each Month",
    "Percentage of Orders per Category",
    "Customer Retention - Orders Across Multiple Months",
    // HR basics
    "Highest Paid Employees per Department",
    "Average Salary by Department",
    "Department Budget Utilization",
    "Employee Salary Rank within Department",
    "Employees Hired After 2020",
    "Headcount per Department",
    "Salary Above Department Average",
    "Managers and Their Direct Reports",
    "Employees Without a Manager",
    "Department with Highest Total Salary",
    "Employee Tenure in Years",
    "Salary Quartiles",
    "Departments Under Budget",
    "Second Highest Salary",
    "Employees Earning More Than Their Manager",
    "Average Salary Across All Departments",
    "New Hires Per Year",
    "Employees in Engineering Department",
    "Salary Band Count",
    "Departments with No Employees",
    "Employee Salary Difference from Department Average",
    "ROW_NUMBER for Employee Seniority",
    "Total Salary Cost by Manager",
    "Oldest Employee per Department",
    // School basics
    "Students with GPA above 3.5",
    "Course Enrollment Count",
    "Students Enrolled in Most Courses",
    "Average Grade per Course",
    "Courses Never Enrolled",
    "Top Student per Course",
    "Students in Fall 2023",
    "Instructor with Most Students",
    "Grade Distribution",
    "Students With Perfect GPA",
    "Credits Enrolled per Student",
    "Weighted GPA by Credits",
    "Students Enrolled in Both Semesters",
    "Course with Highest Average Grade",
    "Grade Rank Within Course",
    // Advanced Ecommerce
    "Median Order Value",
    "Customer Cohort by Join Month",
    "Products Not Ordered in March 2024",
    "Revenue Quartile Classification",
    "Customer Lifetime Value Segment",
    "Self Join: Compare Customer Orders",
    "Dense Rank on Product Price",
    "Lead and Lag Order Amounts",
    "CTE: Top Products by Category",
    "EXISTS vs IN Performance Pattern",
    "UNION: Customers and Products Named with A",
    "CROSS JOIN: All Customer-Product Combinations Count",
    "Customers with Exactly 2 Orders",
    "Products with Name Containing 'Pro'",
    "First Order of Each Customer",
    "Product Price Standard Deviation",
    "Total Quantity Sold Per Month",
    "Customers Ranked by Order Count",
    "Furniture Products Total Stock",
    "Recursive CTE: Employee Hierarchy",
    "Department Salary Percentile",
    "Multiple Aggregates in One Query",
    "Students with Below Average GPA",
    "Instructor Revenue Equivalent",
    "Enrollment Count by Grade Level",
    "Students Not Enrolled in Any Course",
    "Running Average Grade per Student",
    "Courses Taught by Prof. Dumbledore",
    "Average Order Value per Product Category (Filtered)",
    "Salary Moving Average",
    "First Value in Department",
    "Customers with Orders in All Months",
    "Product Price vs Category Average",
    "Duplicate Email Check",
    "Rolling 3-Month Revenue",
    "Employees with Salary Between 80k and 100k",
    "Employees Hired in Even Years",
    "Department with Most Senior Employee",
    "Conditional Aggregation: Salary by Band and Department",
    "Course Credits Distribution",
    "Students Ordered by Enrollment Date",
    "Semester Enrollment Summary",
    "Top 3 Students by Weighted GPA",
    "Budget Remaining per Department",
    "All Products with Their Order Count and Revenue",
    "Compare Consecutive Monthly Revenues",
    "Employees with Name Starting with S",
    "Total Orders Value vs Average",
    "Subquery: Products More Expensive Than All Books",
    "Employee Count vs Budget Ratio",
    "Courses with More Than 3 Enrollments",
    "Highest Grade per Student",
    "Employees with AT LEAST One Report in Engineering",
    "Customers by City Count",
    "INNER JOIN vs LEFT JOIN Results",
    "HAVING vs WHERE Distinction",
    "Window Frame: Last 3 Orders Revenue",
    "Group by Hire Year and Department",
    "Max Salary per Hire Year",
    "CTE: Department Summary with Rank",
    "All Order Details with Lookup Columns",
    "Top Instructor by Average Student GPA",
    "Employees in Multiple Departments Check",
    "Monthly New Customer Cumulative Total",
    "Assign Category Budget Rank",
    "Customer Order Gap Analysis",
    "Grade Improvement Across Semesters",
    "Products in Stock vs Out of Stock",
    "Multi-CTE Pipeline: Revenue and Growth",
    "Instructor Course Count",
    "FULL OUTER JOIN Products and Orders",
    "Employees Hired on Same Day",
    "Department Name Uppercase",
    "Orders in Top 10% by Amount",
    "Students and Their Course Count",
    "EXCEPT: Products Ordered in Jan but not Feb",
    "Salary Lag: Compare to Previous Hire",
    "Employees with Salary in Top 3 Overall",
    "Revenue Comparison: Electronics vs Furniture",
    "Courses with GPA Range",
    "Employees with Common Last Name",
    "Order Distribution by Weekday",
    "Number of Unique Products Ordered per Customer",
    "Above-Median Salary Employees",
    "Customer Spend Rank with Dense Rank",
    "Category Revenue Share with ROLLUP",
    "Student Rank by GPA in Grade Level",
    "Total Budget vs Total Salary Company Wide",
    "Product Name Length",
    "Enrollment with Letter Grade",
    "INTERSECT: Customers Who Ordered in Both Jan and Apr 2024",
    "Employee with Maximum Salary in Each Hire Year",
    "Student Grade Percentile",
  ];

  const top50InterviewTitles: string[] = [
    "Top Customers by Spending",
    "Products Never Ordered",
    "Monthly Revenue Report",
    "Revenue by Product Category",
    "Customers with Multiple Orders",
    "Highest Paid Employees per Department",
    "Average Salary by Department",
    "Department Budget Utilization",
    "Employee Salary Rank within Department",
    "Students with GPA above 3.5",
    "Course Enrollment Count",
    "Running Total Order Revenue",
    "Most Expensive Product Per Category",
    "Orders Above Average Amount",
    "Customers Who Never Ordered",
    "Average Order Value by Customer City",
    "Top Selling Products by Quantity",
    "Salary Above Department Average",
    "Managers and Their Direct Reports",
    "Second Highest Salary",
    "Employees Earning More Than Their Manager",
    "Nth Highest Order Amount",
    "Month-over-Month Revenue Growth",
    "Customer First and Last Order",
    "Product Revenue Contribution Percentage",
    "Latest Order per Customer",
    "Cumulative Revenue by Customer",
    "Customer Spending Percentile",
    "Top Product per Category",
    "Salary Quartiles",
    "Customer Lifetime Value Segment",
    "Lead and Lag Order Amounts",
    "Recursive CTE: Employee Hierarchy",
    "Employee Salary Difference from Department Average",
    "Conditional Aggregation: Salary by Band and Department",
    "Weighted GPA by Credits",
    "Students Enrolled in Both Semesters",
    "Grade Rank Within Course",
    "Salary Moving Average",
    "Rolling 3-Month Revenue",
    "Product Price vs Category Average",
    "Revenue Growth Rate by Month",
    "Customers Ordered Both Electronics and Books",
    "CTE: Department Summary with Rank",
    "Orders in Top 10% by Amount",
    "Above-Median Salary Employees",
    "Category Revenue Share with ROLLUP",
    "Student Grade Percentile",
    "Employee with Maximum Salary in Each Hire Year",
    "INTERSECT: Customers Who Ordered in Both Jan and Apr 2024",
  ];

  const aggregationsTitles = [
    "Top Customers by Spending",
    "Monthly Revenue Report",
    "Average Salary by Department",
    "Department Budget Utilization",
    "Revenue by Product Category",
    "Customers with Multiple Orders",
    "Course Enrollment Count",
    "Students with GPA above 3.5",
    "Most Expensive Product Per Category",
    "Customer Order Summary",
    "Headcount per Department",
    "Total Stock Value by Category",
    "Number of Products per Category",
    "Average Order Value by Customer City",
    "New Customers Each Month",
    "Daily Order Count",
    "Total Quantity Sold Per Month",
    "Multiple Aggregates in One Query",
    "Revenue Comparison: Electronics vs Furniture",
    "Category Revenue Share with ROLLUP",
    "Courses with GPA Range",
    "Total Budget vs Total Salary Company Wide",
    "Semester Enrollment Summary",
    "Grade Distribution",
    "Credits Enrolled per Student",
    "Instructor Revenue Equivalent",
    "Enrollment Count by Grade Level",
    "Instructor Course Count",
    "Customers Ranked by Order Count",
    "Course Credits Distribution",
  ];

  const joinsTitles = [
    "Top Customers by Spending",
    "Products Never Ordered",
    "Highest Paid Employees per Department",
    "Average Salary by Department",
    "Revenue by Product Category",
    "Department Budget Utilization",
    "Employee Salary Rank within Department",
    "Course Enrollment Count",
    "Customers Who Never Ordered",
    "Average Order Value by Customer City",
    "Top Selling Products by Quantity",
    "Managers and Their Direct Reports",
    "Employees in Engineering Department",
    "Students with GPA above 3.5",
    "Orders with Product and Customer Details",
    "All Order Details with Lookup Columns",
    "Customers Ordered Both Electronics and Books",
    "Employees Earning More Than Their Manager",
    "Top Student per Course",
    "Self Join: Compare Customer Orders",
    "Employees Hired on Same Day",
    "FULL OUTER JOIN Products and Orders",
    "INNER JOIN vs LEFT JOIN Results",
    "All Products with Their Order Count and Revenue",
    "Employees with AT LEAST One Report in Engineering",
    "Salary Above Department Average",
    "Employee with Maximum Salary in Each Hire Year",
  ];

  const windowFunctionsTitles = [
    "Employee Salary Rank within Department",
    "Running Total Order Revenue",
    "Order Rank by Amount",
    "Nth Highest Order Amount",
    "Customer Spending Percentile",
    "Latest Order per Customer",
    "Cumulative Revenue by Customer",
    "Revenue Growth Rate by Month",
    "Month-over-Month Revenue Growth",
    "Product Sales Rank",
    "Top Product per Category",
    "Salary Quartiles",
    "Lead and Lag Order Amounts",
    "Dense Rank on Product Price",
    "Customer Spend Rank with Dense Rank",
    "Grade Rank Within Course",
    "Salary Moving Average",
    "First Value in Department",
    "Rolling 3-Month Revenue",
    "Window Frame: Last 3 Orders Revenue",
    "Revenue Quartile Classification",
    "ROW_NUMBER for Employee Seniority",
    "Employee Salary Difference from Department Average",
    "Department Salary Percentile",
    "Running Average Grade per Student",
    "Salary Lag: Compare to Previous Hire",
    "Orders in Top 10% by Amount",
    "Above-Median Salary Employees",
    "Student Rank by GPA in Grade Level",
    "Student Grade Percentile",
    "Assign Category Budget Rank",
    "Monthly New Customer Cumulative Total",
    "Employees with Salary in Top 3 Overall",
    "Second Highest Salary",
    "CTE: Department Summary with Rank",
  ];

  const subqueriesTitles = [
    "Products Never Ordered",
    "Highest Paid Employees per Department",
    "Students with GPA above 3.5",
    "Orders Above Average Amount",
    "Products with Above-Average Price",
    "Customer with Highest Single Order",
    "Product Revenue Contribution Percentage",
    "Nth Highest Order Amount",
    "Salary Above Department Average",
    "Second Highest Salary",
    "Customers Ordered Both Electronics and Books",
    "Products Not Ordered in March 2024",
    "Recursive CTE: Employee Hierarchy",
    "CTE: Top Products by Category",
    "Multi-CTE Pipeline: Revenue and Growth",
    "EXISTS vs IN Performance Pattern",
    "Subquery: Products More Expensive Than All Books",
    "Customers with Orders in All Months",
    "Above-Median Salary Employees",
    "Department with Most Senior Employee",
    "EXCEPT: Products Ordered in Jan but not Feb",
    "INTERSECT: Customers Who Ordered in Both Jan and Apr 2024",
    "Employee with Maximum Salary in Each Hire Year",
    "Employees with AT LEAST One Report in Engineering",
    "Students Enrolled in Both Semesters",
    "Top Instructor by Average Student GPA",
  ];

  const categoryMappings: Record<string, string[]> = {
    "neetcode-150": neetcode150Titles,
    "top-50-interview": top50InterviewTitles,
    "aggregations": aggregationsTitles,
    "joins": joinsTitles,
    "window-functions": windowFunctionsTitles,
    "subqueries": subqueriesTitles,
  };

  const validMappings: { assignmentId: string; categoryId: string; position: number }[] = [];

  for (const [slug, titles] of Object.entries(categoryMappings)) {
    const catId = catBySlug[slug];
    if (!catId) { console.warn(`⚠️  Category slug not found: ${slug}`); continue; }
    titles.forEach((title, position) => {
      const assignmentId = byTitle[title];
      if (assignmentId) {
        validMappings.push({ assignmentId, categoryId: catId, position });
      } else {
        console.warn(`⚠️  Assignment title not found: "${title}"`);
      }
    });
  }

  // Insert category mappings in batches
  for (let i = 0; i < validMappings.length; i += BATCH) {
    await db.insert(assignmentCategories).values(validMappings.slice(i, i + BATCH));
  }

  // Print stats
  console.log(`✅ Assignment-category mappings created: ${validMappings.length}`);
  for (const [slug, titles] of Object.entries(categoryMappings)) {
    const mapped = titles.filter((t) => byTitle[t]).length;
    console.log(`   ${slug}: ${mapped} questions`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log("🌱 Starting seed...");
    await createEcommerceSandbox(pool);
    await createHrSandbox(pool);
    await createSchoolSandbox(pool);
    const cats = await seedCategories();
    await seedAssignments(cats);
    console.log("🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();