// Test bcrypt password verification
// Run this with: node test-bcrypt.js

const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash).then(result => {
    console.log('Match result:', result);
    if (result) {
        console.log('✅ PASSWORD MATCHES!');
    } else {
        console.log('❌ PASSWORD DOES NOT MATCH');
        console.log('\nGenerating new hash...');
        bcrypt.hash(password, 10).then(newHash => {
            console.log('New hash:', newHash);
        });
    }
}).catch(err => {
    console.error('Error:', err);
});
