/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;

/**
 * @author zyy43688
 * @version $Id: Main.java, v 0.1 2018年1月31日 下午3:19:06 zyy43688 Exp $
 */
public class Main {
    public static void main(String[] args) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
        InvocationHandler handler = new MyInvocationHandler();

        Class<?> proxyClass = Proxy.getProxyClass(Foo.class.getClassLoader(), Foo.class);

        Foo f = (Foo) proxyClass.getConstructor(InvocationHandler.class).newInstance(handler);

        f.introduction();
        f.introduction("张玉尧！");
    }
}