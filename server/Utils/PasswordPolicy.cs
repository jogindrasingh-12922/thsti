using System;
using System.Linq;

namespace ThstiServer.Utils
{
    public class PasswordValidationResult
    {
        public bool Valid { get; set; }
        public string? Message { get; set; }
    }

    public static class PasswordPolicy
    {
        private static readonly string[] BLOCKED_TERMS = { "thsti", "admin", "institute", "password", "qwerty", "123456", "letmein" };

        public static PasswordValidationResult ValidatePassword(string plain)
        {
            if (string.IsNullOrEmpty(plain) || plain.Length < 12)
            {
                return new PasswordValidationResult { Valid = false, Message = "Password must be at least 12 characters long." };
            }

            if (plain.Length > 72)
            {
                return new PasswordValidationResult { Valid = false, Message = "Password must not exceed 72 characters." };
            }

            bool hasUpper = plain.Any(char.IsUpper);
            bool hasLower = plain.Any(char.IsLower);
            bool hasDigit = plain.Any(char.IsDigit);
            bool hasSpecial = plain.Any(c => !char.IsLetterOrDigit(c));

            int complexityScore = (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);

            if (complexityScore < 3)
            {
                return new PasswordValidationResult { Valid = false, Message = "Password must contain at least 3 of: uppercase letter, lowercase letter, number, special character." };
            }

            string lowerPlain = plain.ToLowerInvariant();
            foreach (var term in BLOCKED_TERMS)
            {
                if (lowerPlain.Contains(term))
                {
                    return new PasswordValidationResult { Valid = false, Message = "Password contains a commonly used or disallowed word." };
                }
            }

            return new PasswordValidationResult { Valid = true };
        }
    }
}
