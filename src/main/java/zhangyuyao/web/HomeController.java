/**
 * LY.com Inc.
 * Copyright (c) 2004-2017 All Rights Reserved.
 */
package zhangyuyao.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 主页控制器
 *
 * @author zyy43688
 * @version $Id: HomeController.java, v 0.1 2017年12月20日 上午10:33:27 zyy43688 Exp $
 */
@Controller
@RequestMapping("home")
public class HomeController {

    @RequestMapping("test")
    @ResponseBody
    public String test() {
        return "This is a test!";
    }

    @RequestMapping("myPage")
    public String myPage() {
        return "myPage";
    }
}