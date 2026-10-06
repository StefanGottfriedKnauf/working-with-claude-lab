package com.marlowefinch.ops;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * A closed date range for the query endpoints.
 *
 * A missing `to` defaults to today and a missing `from` to 30 days before `to`. Validation lives in
 * {@link #resolve}, not in the constructor, so repository code can still build any range.
 */
public record DateRange(LocalDate from, LocalDate to) {

    public static final int DEFAULT_DAYS = 30;
    public static final int MAX_SPAN_DAYS = 366;

    /** Resolves the range or throws {@link ValidationException}. */
    public static DateRange resolve(String from, String to, Clock clock) {
        List<String> errors = new ArrayList<>();
        DateRange range = resolve(from, to, clock, errors);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
        return range;
    }

    /** Resolves the range, appending any problems to {@code errors} (result is then null). */
    public static DateRange resolve(String from, String to, Clock clock, List<String> errors) {
        LocalDate today = LocalDate.now(clock);
        boolean hasFrom = from != null && !from.isBlank();
        LocalDate start = hasFrom ? parse(from, "from", errors) : null;
        LocalDate end = to == null || to.isBlank() ? today : parse(to, "to", errors);
        // A missing from is 30 days before the end, so an older `to` alone is still a valid request.
        if (!hasFrom) {
            start = (end == null ? today : end).minusDays(DEFAULT_DAYS);
        }
        if (start == null || end == null) {
            return null;
        }
        if (start.isAfter(end)) {
            errors.add("from must be on or before to");
            return null;
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_SPAN_DAYS) {
            errors.add("the range from..to must span at most " + MAX_SPAN_DAYS + " days");
            return null;
        }
        return new DateRange(start, end);
    }

    private static LocalDate parse(String value, String name, List<String> errors) {
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            errors.add(name + " must be an ISO date (YYYY-MM-DD)");
            return null;
        }
    }
}
