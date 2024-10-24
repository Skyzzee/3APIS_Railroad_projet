const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définition du schéma pour l'utilisateur
const UserSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },  // Mot de passe hashé
    role: { type: String, enum: ['user', 'admin', 'employee'], default: 'user' },
}, { timestamps: true });

// Hash de mot de passe avant de le sauvegarder en base
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);  // Génère un code pour améliorer la sécurité du hash
        this.password = await bcrypt.hash(this.password, salt);  // Hash du mot de passe
        console.log('Mot de passe haché lors de la sauvegarde:', this.password); // Affiche le mot de passe haché
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer le mot de passe lors de la connexion
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparaison des mots de passe:', {
        provided: candidatePassword,
        stored: this.password,
        isMatch: isMatch,
    }); // Affiche les mots de passe comparés
    return isMatch;
};


const User = mongoose.model('User', UserSchema);

module.exports = User;
