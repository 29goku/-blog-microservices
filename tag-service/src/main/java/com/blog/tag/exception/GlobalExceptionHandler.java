package com.blog.tag.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(TagNotFoundException.class)
  public ResponseEntity<String> handleTagNotFoundException(TagNotFoundException e) {
    return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(TagAlreadyAssignedException.class)
  public ResponseEntity<String> handleTagAlreadyAssignedException(TagAlreadyAssignedException e) {
    return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
  }

  @ExceptionHandler(TagAlreadyExistsException.class)
  public ResponseEntity<String> handleTagAlreadyExistsException(TagAlreadyExistsException e) {
    return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleException(Exception e) {
    return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
