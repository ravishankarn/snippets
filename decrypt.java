import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESCBCDecryptor {
    public static String decrypt(String encryptedText, String key, String iv) throws Exception {
        byte[] decodedKey = Base64.getDecoder().decode(key);
        byte[] decodedIV = Base64.getDecoder().decode(iv);
        byte[] cipherText = Base64.getDecoder().decode(encryptedText);

        SecretKeySpec secretKeySpec = new SecretKeySpec(decodedKey, "AES");
        IvParameterSpec ivParameterSpec = new IvParameterSpec(decodedIV);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec);

        byte[] decryptedBytes = cipher.doFinal(cipherText);
        return new String(decryptedBytes);
    }

    public static void main(String[] args) {
        try {
            String encryptedText = "Replace with the C# generated encrypted text";
            String key = "Replace with the C# generated key";
            String iv = "Replace with the C# generated IV";

            String decryptedText = decrypt(encryptedText, key, iv);
            System.out.println("Decrypted Text: " + decryptedText);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
