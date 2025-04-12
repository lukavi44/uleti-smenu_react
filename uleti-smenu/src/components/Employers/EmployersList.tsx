import { useEmployers } from "../../hooks/useEmployers";
import LoadingContext from "../../store/Loading-context";
import { useContext } from "react";
import styles from './EmployersList.scss';
import Card from "../UI/Card/Card";
import { Employer } from "../../models/User.model";
import foto from '../../assets/restoran1.jpg';

const EmployersList = () => {
  const { employers, error } = useEmployers();
  const { isLoading } = useContext(LoadingContext);


  if (isLoading) return <div className="text-center py-6">Učitavanje...</div>;
  if (error) return <div className="text-center py-6 text-red-600">{error}</div>;
  if (employers.length === 0) return <div className="text-center py-6">Nema dostupnih poslodavaca.</div>;

  return (
    <div className="w-full px-4">
      <h2 className="text-xl font-semibold mb-4">Naši poslodavci</h2>
      <div>

      {employers.map((employer: Employer, index: number) => {
        return (
            <div key={employer.id}>
              <Card title={employer.email} img={foto} description="" />
            </div>
          );
    })}
    </div>
    </div>
  );
};

export default EmployersList;
