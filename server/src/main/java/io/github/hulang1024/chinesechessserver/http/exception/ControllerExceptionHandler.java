package io.github.hulang1024.chinesechessserver.api.exception;

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
    public Ret<Void> handleBindException(BindException e) {
        return bindingResultToRet(e.getBindingResult());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Ret<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        return bindingResultToRet(e.getBindingResult());
    }
    @ExceptionHandler(ConstraintViolationException.class)
    public Ret<Void> handleConstraintViolationException(ConstraintViolationException e) {
        return Ret.<Void>error().msg(e.getLocalizedMessage());
    }

    private Ret<Void> bindingResultToRet(BindingResult bindingResult) {
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

        return Ret.<Void>error().msg(message);
    }
}
