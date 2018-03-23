/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.classlodaer;

/**
 * 类加载器实例
 *
 * @author zyy43688
 * @version $Id: ClassLoaderDemo.java, v 0.1 2018年3月16日 下午2:53:34 zyy43688 Exp $
 */
public class ClassLoaderDemo {
    public static void main(String[] args) {
        System.out.println("测试类加载器的顺序！");

        ClassLoader classLoader = ClassLoaderDemo.class.getClassLoader();

        while (classLoader != null) {
            System.out.println(classLoader);
            classLoader = classLoader.getParent();
        }

        System.out.println(classLoader);
    }
}