package com.blog.tag.exception;

public class TagAlreadyAssignedException extends RuntimeException {

  public TagAlreadyAssignedException(String message) {
    super(message);
  }
}
