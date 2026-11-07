<?php

namespace App\Support\Corex;

use Illuminate\Validation\ValidationException;

/**
 * A 422 from CoreX. Keeps the "data" CoreX sends with a refused bid (the fresh bidding state)
 * so the lot page can reset its bid box to the new minimum straight away.
 */
class CorexRefusal extends ValidationException
{
    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = null;

    /**
     * @param  array<string, array<int, string>|string>  $errors
     * @param  array<string, mixed>|null  $data
     */
    public static function fromResponse(array $errors, ?array $data): self
    {
        $exception = static::withMessages($errors);
        $exception->data = $data;

        return $exception;
    }
}
