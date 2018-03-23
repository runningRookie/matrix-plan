/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.classlodaer;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author zyy43688
 * @version $Id: ClassLoaderTest.java, v 0.1 2018年3月16日 下午4:52:05 zyy43688 Exp $
 */
public class ClassLoaderTest {
    public static void main(String[] args) {
        try {
            String rootUrl = "http://localhost:9090/zhangyuyao/js/classes";
            NetworkClassLoader networkClassLoader = new NetworkClassLoader(rootUrl);
            String className = "zhangyuyao.web.HomeController";
            Class clazz = networkClassLoader.loadClass(className);
            System.out.println(clazz.getClassLoader());
            Object object = clazz.newInstance();
            System.out.println(clazz.getSimpleName());
            Method[] methods = clazz.getDeclaredMethods();
            for (Method m : methods) {
                System.out.println(m.getName());
                System.out.println(m.invoke(object));
            }
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException | InvocationTargetException e) {
            e.printStackTrace();
        }

    }
}