/** @type {import('next').NextConfig} */

console.log('Hello from next.config.js!!');
console.log('process.env.BASE_PATH: ' + process.env.BASE_PATH);

const nextConfig = {
  basePath: '/tacomail',
};

module.exports = nextConfig;
