package com.project.footdecision.models;

import com.project.footdecision.models.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Entity
@Table(name = "tb_user")
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Setter
    String username;

    @Setter
    String fullname;

    UserRole role;

    public User(){
    }

    public User(Long id, String username, String fullname, UserRole role) {
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.role = role;
    }




}
