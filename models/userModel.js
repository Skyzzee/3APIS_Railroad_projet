const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'employee'], default: 'user' },
}, { timestamps: true });

// Hash de mot de passe avant de le sauvegarder en base
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const code = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, code);  // Hash du mot de passe
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer le mot de passe lors de la connexion
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
