/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.classlodaer;

/**
 * @author zyy43688
 * @version $Id: ClassLoaderDemo1.java, v 0.1 2018年3月16日 下午4:05:31 zyy43688 Exp $
 */
public class ClassLoaderDemo1 {
    public static void main(String[] args) {
        System.out.println(System.getProperty("java.ext.dirs"));

        ClassLoader classLoader = ClassLoaderDemo.class.getClassLoader();

        while (classLoader != null) {
            System.out.println(classLoader);
            classLoader = classLoader.getParent();
        }

        System.out.println(classLoader);
    }
}