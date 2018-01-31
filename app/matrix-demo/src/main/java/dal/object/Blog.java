/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package dal.object;

/**
 * @author zyy43688
 * @version $Id: Blog.java, v 0.1 2018年1月24日 上午10:08:47 zyy43688 Exp $
 */
public class Blog {
    /**
     * 主键
     */
    private Integer id;

    /**
     * 消息体
     */
    private String  message;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}