// Generate correct bcrypt hash for admin123
const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
    console.log('=================================');
    console.log('Password:', password);
    console.log('Bcrypt Hash:', hash);
    console.log('=================================');
    console.log('\nRun this SQL in Supabase:');
    console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';`);
}).catch(err => {
    console.error('Error:', err);
});
