<?php

namespace App\Models;

use Database\Factories\SiteDocumentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * A file the admin uploads for the "Auction documents" section of the home page.
 * Files live on the private disk and are only served through the download route.
 */
class SiteDocument extends Model
{
    /** @use HasFactory<SiteDocumentFactory> */
    use HasFactory;

    public const DISK = 'local';

    public const ACCESS_EVERYONE = 'everyone';

    public const ACCESS_SIGNED_IN = 'signed_in';

    /**
     * @var array<string, string>
     */
    public const ACCESS_OPTIONS = [
        self::ACCESS_EVERYONE => 'Everyone (no login needed)',
        self::ACCESS_SIGNED_IN => 'Signed-in buyers only',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'file_path',
        'original_name',
        'size',
        'access',
        'sort_order',
        'is_published',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * @param  Builder<SiteDocument>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * @param  Builder<SiteDocument>  $query
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('title');
    }

    public function requiresLogin(): bool
    {
        return $this->access === self::ACCESS_SIGNED_IN;
    }

    public function extension(): string
    {
        return strtoupper(pathinfo($this->original_name, PATHINFO_EXTENSION));
    }

    public function deleteFile(): void
    {
        Storage::disk(self::DISK)->delete($this->file_path);
    }
}
