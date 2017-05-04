class X {
  f() {}
}

const x = new X();
const f_bind = ::x.f;

f_bind();

