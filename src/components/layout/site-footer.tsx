export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-8">
      <div className="container flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold text-foreground">Abdullah Farghly</p>
        <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} جميع الحقوق محفوظة لصالون البحراوي VIP    
        </p>
      </div>
    </footer>
  );
}
