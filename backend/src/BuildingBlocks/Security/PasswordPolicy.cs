using System.Globalization;
using System.Text;

namespace CraftVision.Security;

public static class PasswordPolicy
{
    public const string ValidationMessage = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (không tính khoảng trắng).";

    public static bool IsValid(string? password)
    {
        if (string.IsNullOrEmpty(password)) return false;
        var length = 0;
        var uppercase = false;
        var lowercase = false;
        var number = false;
        var special = false;
        foreach (var rune in password.EnumerateRunes())
        {
            length++;
            var category = Rune.GetUnicodeCategory(rune);
            uppercase |= category == UnicodeCategory.UppercaseLetter;
            lowercase |= category == UnicodeCategory.LowercaseLetter;
            number |= category == UnicodeCategory.DecimalDigitNumber;
            special |= Rune.IsPunctuation(rune) || Rune.IsSymbol(rune);
        }
        return length >= 8 && uppercase && lowercase && number && special;
    }

    public static void Validate(string? password)
    {
        if (!IsValid(password)) throw new ArgumentException(ValidationMessage);
    }
}
