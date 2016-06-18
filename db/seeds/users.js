exports.seed = function(knex, Promise) {
  return Promise.join(
    knex('users').del(),
    knex('users').insert({
      name: 'John Lennon',
      email: 'john@example.com',
      salt: 'crTuA2Ct+esYcWTjLf1IOpf4bowEWhRL/Qp4Vdji22tUd/k4UKZtUxRC3jInT9XHoAoFxHlRaNW78MeCTceoAe/k2rWApNwlOPh0gHQ71gesp3atT9Ee5SehZv1cKW1aiUHWpDT8VU35bfou2WQb//6N8vm7KpPLBYsT0Gr2ufU=',
      encrypted_password: 'HaV19jsWDDYCz7iKhKQ+b/OznPu7DncOOQpxAo0FvSbqLXLcDdz5u/joJ/n/vxl/5WOOvq7qA8RDyvF1E0egg54oL7Po6LDR8L2noaHaEmUu8rJ6j+gjbJv0ttragxRPBfp7MdzFPsAgh0Orosqrc+iK6YjWTqghkNpVHsb+IYs='
    })
  );
};
