SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;

-- suboptimal solution
-- SELECT reservations.id, title, start_date, cost_per_night, average_rating
-- FROM reservations
-- JOIN properties ON reservations.property_id=properties.id
-- JOIN (
--   SELECT property_id, AVG(rating) AS average_rating
--   FROM property_reviews
--   GROUP BY property_id
-- ) AS average_ratings
-- ON average_ratings.property_id=reservations.property_id 
-- WHERE reservations.guest_id=1
-- GROUP BY reservations.id, title, cost_per_night, average_rating;

