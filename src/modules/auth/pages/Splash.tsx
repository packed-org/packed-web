import logoPacked from '@/assets/Logo_Packed.svg';

export function Splash() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-petroleo p-6 md:p-12 select-none">
      <div className="flex-1" />

      <div className="flex flex-col items-center justify-center">
        <img
          src={logoPacked}
          alt="PACKED"
          className="w-48 md:w-72 max-w-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-end w-full max-w-xs md:max-w-sm mb-8 md:mb-12">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-petroleo-soft/20">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-sol" />
        </div>
      </div>
    </div>
  );
}