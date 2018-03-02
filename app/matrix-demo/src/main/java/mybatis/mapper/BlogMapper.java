/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package mybatis.mapper;

import org.apache.ibatis.annotations.Select;

import mybatis.object.Blog;

/**
 * Blog映射类
 *
 * @author zyy43688
 * @version $Id: BlogMapper.java, v 0.1 2018年3月1日 下午6:58:37 zyy43688 Exp $
 */
public interface BlogMapper {
    @Select("SELECT * FROM Blog WHERE id = #{id}")
    Blog getBlogById(Integer id);
}
