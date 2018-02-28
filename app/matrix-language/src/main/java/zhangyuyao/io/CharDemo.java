/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.Arrays;

/**
 * 字符实例
 *
 * @author zyy43688
 * @version $Id: CharDemo.java, v 0.1 2018年2月28日 上午9:44:27 zyy43688 Exp $
 */
public class CharDemo {
    public static void main(String[] args) throws UnsupportedEncodingException {
        String name = "";
        byte[] bytes = name.getBytes();
        byte[] bytes1 = name.getBytes("UNICODE");
        byte[] bytes2 = name.getBytes("UTF-8");
        System.out.println(Arrays.toString(bytes));
        System.out.println(Arrays.toString(bytes1));
        System.out.println(Arrays.toString(bytes2));
        String name1 = new String(bytes);
        System.out.println(name1);

        System.out.println("-------------------");
        for (byte b : bytes) {
            System.out.printf("%X,", b);
        }

        System.out.println();
        for (byte b : bytes1) {
            System.out.printf("%X,", b);
        }

        System.out.println();
        for (byte b : bytes2) {
            System.out.printf("%X,", b);
        }

        System.out.println("-----------------");

        byte[] bytes3 = new byte[] { 92, 39 };

        String 尧 = new String(bytes3, "UNICODE");

        System.out.println(尧);

        System.out.println(Arrays.toString(尧.getBytes("UNICODE")));

        System.out.println(Charset.defaultCharset());

        byte bNum = (byte) 1;
        System.out.println(bNum);
        for (int i = 0; i < 200; i++) {
            bNum++;
            System.out.println(bNum);
        }
    }
}