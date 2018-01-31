/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.init;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

import zhangyuyao.config.AppConfig;
import zhangyuyao.config.DispatcherConfig;

/**
 * @author zyy43688
 * @version $Id: MyWebApplicationInitializer.java, v 0.1 2018年1月30日 上午9:52:48 zyy43688 Exp $
 */
public class MyWebApplicationInitializer implements WebApplicationInitializer {
    //    /**
    //     * 还是使用的配置文件
    //     *
    //     * @param servletContext
    //     * @throws ServletException
    //     */
    //    @Override
    //    public void onStartup(ServletContext servletContext) throws ServletException {
    //
    //        XmlWebApplicationContext appContext = new XmlWebApplicationContext();
    //        appContext.setConfigLocation("/WEB-INF/dispatcherServlet-servlet.xml");
    //
    //        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(appContext));
    //
    //        dispatcher.setLoadOnStartup(1);
    //        dispatcher.addMapping("/");
    //    }

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(AppConfig.class);

        servletContext.addListener(new ContextLoaderListener(rootContext));

        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(DispatcherConfig.class);

        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));

        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}