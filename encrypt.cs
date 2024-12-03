using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

class AESCBCEncryptor
{
    public static (string encryptedText, string key, string iv) Encrypt(string plainText)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            aes.GenerateKey();
            aes.GenerateIV();

            string key = Convert.ToBase64String(aes.Key);
            string iv = Convert.ToBase64String(aes.IV);

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter sw = new StreamWriter(cs))
                    {
                        sw.Write(plainText);
                    }
                }
                string encryptedText = Convert.ToBase64String(ms.ToArray());
                return (encryptedText, key, iv);
            }
        }
    }

    static void Main()
    {
        string plainText = "Hello, this is a secret message!";
        var (encryptedText, key, iv) = Encrypt(plainText);

        Console.WriteLine($"Encrypted Text: {encryptedText}");
        Console.WriteLine($"Key: {key}");
        Console.WriteLine($"IV: {iv}");
    }
}
