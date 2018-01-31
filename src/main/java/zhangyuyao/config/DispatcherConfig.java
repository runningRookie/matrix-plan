/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * @author zyy43688
 * @version $Id: DispatcherConfig.java, v 0.1 2018年1月30日 上午10:27:42 zyy43688 Exp $
 */
@Configuration
public class DispatcherConfig {

    @Bean("viewResolver")
    public InternalResourceViewResolver getInternalResourceViewResolver() {
        InternalResourceViewResolver internalResourceViewResolver = new InternalResourceViewResolver();

        internalResourceViewResolver.setPrefix("/WEB-INF/page/");
        internalResourceViewResolver.setSuffix(".jsp");

        return internalResourceViewResolver;
    }
}