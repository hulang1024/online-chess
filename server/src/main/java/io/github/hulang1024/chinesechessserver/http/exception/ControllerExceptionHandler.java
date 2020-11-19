package io.github.hulang1024.chinesechessserver.http.exception;

import io.github.hulang1024.chinesechessserver.http.results.room.ErrorRet;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolationException;
import java.util.List;

@RestControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorRet> handleBindException(BindException e) {
        return bindingResultToRet(e.getBindingResult());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRet> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        return bindingResultToRet(e.getBindingResult());
    }
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorRet> handleConstraintViolationException(ConstraintViolationException e) {
        return ResponseEntity.badRequest().body(new ErrorRet(e.getLocalizedMessage()));
    }

    private ResponseEntity<ErrorRet> bindingResultToRet(BindingResult bindingResult) {
        String message = "";

        if (bindingResult.hasErrors()) {
            List<ObjectError> errors = bindingResult.getAllErrors();
            if (errors != null) {
                if (errors.size() > 0) {
                    if (errors.get(0) instanceof FieldError) {
                        FieldError fieldError = (FieldError) errors.get(0);
                        message = "'" + fieldError.getField() + "'" + " " + fieldError.getDefaultMessage();
                    }
                }
            }
        }

        return ResponseEntity.badRequest().body(new ErrorRet(message));
    }
}
